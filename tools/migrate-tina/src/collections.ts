import { type Ctx, refId, upsert } from './context'
import { transformBlocks } from './blocks'
import { kindMaker } from './event-kinds'
import { resolveMedia } from './media'
import { listContent, readTinaFile, type TinaFile } from './read'
import { eventSlug } from '@sites/cms/event-slug'
import { fileSlug, uniqueSlug } from './slug'

/** `events/en/x.mdx` gives `en`. A file outside a locale folder gives undefined. */
function languageOf(legacyId: string): 'en' | 'nl' | undefined {
  const second = legacyId.split('/')[1]
  return second === 'en' || second === 'nl' ? second : undefined
}

async function each(
  ctx: Ctx,
  contentDir: string,
  folder: string,
  fn: (file: TinaFile) => Promise<void>,
  /** Sorts the files, for content where one file must be imported before another. */
  order?: (a: string, b: string) => number,
): Promise<void> {
  const files = listContent(contentDir, folder)
  for (const rel of order ? [...files].sort(order) : files) {
    try {
      if (ctx.fixups.removeFiles.includes(rel)) {
        await removeImported(ctx, folder, rel)
        ctx.report.add('skipped', rel, 'removed by a fix-up')
        continue
      }
      await fn(readTinaFile(contentDir, rel))
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
}

/**
 * Removes what an earlier run made from a content file. Only items of this site that carry
 * the file's name as their origin are touched, so nothing an editor made can be hit.
 * The folder names of the old content are the collection names.
 */
async function removeImported(ctx: Ctx, collection: string, legacyId: string): Promise<void> {
  await ctx.payload.delete({
    collection: collection as never,
    where: { and: [{ legacyId: { equals: legacyId } }, { tenant: { equals: ctx.tenantId } }] },
    overrideAccess: true,
  })
}

export async function importPeople(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'authors', async (f) => {
    await upsert(ctx, 'authors', f.legacyId, {
      name: f.data.name,
      avatar: resolveMedia(ctx, f.data.avatar, f.legacyId),
    })
  })
  await each(ctx, contentDir, 'speakers', async (f) => {
    await upsert(ctx, 'speakers', f.legacyId, {
      name: f.data.name,
      avatar: resolveMedia(ctx, f.data.avatar, f.legacyId),
      affiliation: f.data.affiliation,
      bio: await ctx.toLexical(f.data.bio, f.legacyId),
    })
  })
  await each(ctx, contentDir, 'tags', async (f) => {
    await upsert(ctx, 'tags', f.legacyId, { name: f.data.name })
  })
}

export async function importEvents(ctx: Ctx, contentDir: string): Promise<void> {
  // Events had no address of their own on the old site, so they get a readable one: title and date.
  const used = new Set<string>()
  const kindOf = kindMaker(ctx)
  await each(ctx, contentDir, 'events', async (f) => {
    const d = f.data
    await upsert(ctx, 'events', f.legacyId, {
      title: d.title,
      slug: uniqueSlug(eventSlug(d.title, d.startDate), languageOf(f.legacyId), used),
      language: languageOf(f.legacyId),
      description: d.description,
      location: {
        address: d.location?.address,
        mapsLink: d.location?.mapsLink,
        callLink: d.location?.callLink,
      },
      startDate: d.startDate,
      endDate: d.endDate || undefined,
      kind: await kindOf(d.eventType),
      speakers: ((d.speakers ?? []) as any[]).map((s) => ({
        speaker: refId(ctx, s.speaker, f.legacyId),
        role: s.role,
      })),
      // The old editor had two picture fields. The cover was the one shown large.
      image: resolveMedia(ctx, d.coverImage || d.image, f.legacyId),
      status: 'scheduled',
      featured: Boolean(d.featured),
      registrationLink: await ctx.toLexical(d.registrationLink, f.legacyId),
    })
  })
}

/**
 * A vacancy is one post in two languages. The old site had a file per language, so the Dutch
 * file with the same name as an English one becomes the Dutch of that post. English files go
 * first, so the post exists when its Dutch arrives.
 */
export async function importVacancies(ctx: Ctx, contentDir: string): Promise<void> {
  const english = new Set(
    listContent(contentDir, 'vacancies')
      .filter((rel) => languageOf(rel) !== 'nl')
      .map(fileSlug),
  )
  const order = (rel: string) => (languageOf(rel) === 'nl' ? 1 : 0)

  await each(
    ctx,
    contentDir,
    'vacancies',
    async (f) => {
      const d = f.data
      // The parts that are written out, and so differ per language.
      const words = {
        title: d.title,
        duration: d.duration,
        description: await ctx.toLexical(d.description, f.legacyId),
        responsibilities: await ctx.toLexical(d.responsibilities, f.legacyId),
        requiredSkills: d.requiredSkills ?? [],
        preferredQualities: await ctx.toLexical(d.preferredQualities, f.legacyId),
        languagesRequired: d.languagesRequired ?? [],
        compensation: { details: d.compensation?.details },
        accessibilityNotes: d.accessibilityNotes,
        howToApply: await ctx.toLexical(d.howToApply, f.legacyId),
        valuesStatement: await ctx.toLexical(d.valuesStatement, f.legacyId),
      }
      const dutch = languageOf(f.legacyId) === 'nl'
      if (dutch && english.has(fileSlug(f.legacyId))) {
        await upsert(ctx, 'vacancies', f.legacyId.replace('/nl/', '/en/'), words, 'nl')
        return
      }
      const settings = {
        slug: fileSlug(f.legacyId),
        opportunityType: d.opportunityType,
        location: { type: d.location?.type, cityRegion: d.location?.cityRegion },
        startDate: d.startDate || undefined,
        openApplication: Boolean(d.openApplication),
        applicationDeadline: d.applicationDeadline || undefined,
        contactInfo: { name: d.contactInfo?.name, email: d.contactInfo?.email, phone: d.contactInfo?.phone },
        supportingDocument: resolveMedia(ctx, d.supportingDocument, f.legacyId),
        openToNontraditional: Boolean(d.openToNontraditional),
      }
      await upsert(ctx, 'vacancies', f.legacyId, { ...settings, ...words }, 'en')
      if (dutch) {
        // Written in Dutch only. English visitors read the Dutch until someone translates it.
        await upsert(ctx, 'vacancies', f.legacyId, words, 'nl')
        ctx.report.add('unpaired-locale', f.legacyId, 'vacancy exists in Dutch only; the Dutch text is shown in English too')
      }
    },
    (a, b) => order(a) - order(b),
  )
}

export async function importNewsletters(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'newsletters', async (f) => {
    const d = f.data
    await upsert(ctx, 'newsletters', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      type: d.type,
      organization: d.organization,
      publishDate: d.publishDate,
      tags: d.tags ?? [],
      externalLink: d.externalLink,
      linkDescription: d.linkDescription,
      author: refId(ctx, d.author, f.legacyId),
      featuredImage: resolveMedia(ctx, d.featuredImage, f.legacyId),
      excerpt: await ctx.toLexical(d.excerpt, f.legacyId),
      body: await transformBlocks(ctx, d.body, f.legacyId),
      featured: Boolean(d.featured),
      _status: d.published === false ? 'draft' : 'published',
    })
  })
}

export async function importPastEvents(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'past-events', async (f) => {
    const d = f.data
    const tags = ((d.tags ?? []) as any[])
      .map((t) => refId(ctx, t?.tag, f.legacyId))
      .filter((id) => id !== undefined)
    await upsert(ctx, 'past-events', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      heroImg: resolveMedia(ctx, d.heroImg, f.legacyId),
      excerpt: await ctx.toLexical(d.excerpt, f.legacyId),
      author: refId(ctx, d.author, f.legacyId),
      date: d.date,
      relatedEvent: refId(ctx, d.relatedEvent, f.legacyId),
      tags,
      blocks: await transformBlocks(ctx, d.blocks, f.legacyId),
      body: await ctx.toLexical(f.body, f.legacyId),
      _status: 'published',
    })
  })
}
