import { type Ctx, refId, upsert } from './context'
import { transformBlocks } from './blocks'
import { resolveMedia } from './media'
import { listContent, readTinaFile, type TinaFile } from './read'
import { fileSlug } from './slug'

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
): Promise<void> {
  for (const rel of listContent(contentDir, folder)) {
    try {
      await fn(readTinaFile(contentDir, rel))
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
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
  await each(ctx, contentDir, 'events', async (f) => {
    const d = f.data
    await upsert(ctx, 'events', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      description: d.description,
      location: {
        address: d.location?.address,
        mapsLink: d.location?.mapsLink,
        callLink: d.location?.callLink,
      },
      startDate: d.startDate,
      endDate: d.endDate || undefined,
      eventType: d.eventType,
      speakers: ((d.speakers ?? []) as any[]).map((s) => ({
        speaker: refId(ctx, s.speaker, f.legacyId),
        role: s.role,
      })),
      image: resolveMedia(ctx, d.image, f.legacyId),
      coverImage: resolveMedia(ctx, d.coverImage, f.legacyId),
      featured: Boolean(d.featured),
      registrationLink: await ctx.toLexical(d.registrationLink, f.legacyId),
    })
  })
}

export async function importVacancies(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'vacancies', async (f) => {
    const d = f.data
    await upsert(ctx, 'vacancies', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      opportunityType: d.opportunityType,
      location: { type: d.location?.type, cityRegion: d.location?.cityRegion },
      startDate: d.startDate || undefined,
      duration: d.duration,
      openApplication: Boolean(d.openApplication),
      applicationDeadline: d.applicationDeadline || undefined,
      description: await ctx.toLexical(d.description, f.legacyId),
      responsibilities: await ctx.toLexical(d.responsibilities, f.legacyId),
      requiredSkills: d.requiredSkills ?? [],
      preferredQualities: await ctx.toLexical(d.preferredQualities, f.legacyId),
      languagesRequired: d.languagesRequired ?? [],
      compensation: { details: d.compensation?.details },
      accessibilityNotes: d.accessibilityNotes,
      howToApply: await ctx.toLexical(d.howToApply, f.legacyId),
      contactInfo: {
        name: d.contactInfo?.name,
        email: d.contactInfo?.email,
        phone: d.contactInfo?.phone,
      },
      supportingDocument: resolveMedia(ctx, d.supportingDocument, f.legacyId),
      valuesStatement: await ctx.toLexical(d.valuesStatement, f.legacyId),
      openToNontraditional: Boolean(d.openToNontraditional),
    })
  })
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
