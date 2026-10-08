import { withAddedBlocks } from './add-blocks'
import { transformBlocks } from './blocks'
import { readAsGalleries } from './gallery-pages'
import { type Ctx, upsert } from './context'
import { emptyKeysToSkip, planPages, type PagePlan } from './pages-plan'
import { listContent, readTinaFile } from './read'
import { Report } from './report'

async function localeData(ctx: Ctx, contentDir: string, file: string, slug: string, key: string) {
  const f = readTinaFile(contentDir, file)
  // The old site never showed this text. A fix-up can leave it out, for placeholder text.
  const leaveOutBody = ctx.fixups.clearPageBodies.includes(key)
  if (leaveOutBody && f.body?.trim()) ctx.report.add('skipped', f.legacyId, 'hidden text left out by a fix-up')
  const own = await transformBlocks(ctx, f.data.blocks, f.legacyId)
  const blocks = ctx.fixups.galleryPages.includes(key) ? await asGalleries(ctx, own, f.legacyId) : own
  return {
    data: {
      title: f.data.title,
      slug,
      blocks: withAddedBlocks(blocks, ctx.fixups.addBlocks[key] ?? []),
      body: leaveOutBody ? null : await ctx.toLexical(f.body, f.legacyId),
    },
    previousUrls: (f.data.previousUrls ?? []) as string[],
  }
}

/**
 * For a page named as a photo page in the fix-ups: each text block that reads as photos with
 * captions becomes one gallery block per heading. The captions are saved on the pictures, in
 * the language of the page, which is where galleries read them.
 */
async function asGalleries(ctx: Ctx, blocks: Record<string, unknown>[], legacyId: string): Promise<Record<string, unknown>[]> {
  const locale = legacyId.split('/')[1] === 'nl' ? 'nl' : 'en'
  const out: Record<string, unknown>[] = []
  let turned = 0
  for (const block of blocks) {
    const galleries = block.blockType === 'content' ? readAsGalleries(block.body as never) : undefined
    if (!galleries) {
      out.push(block)
      continue
    }
    for (const gallery of galleries) {
      for (const image of gallery.images) {
        if (!image.caption) continue
        await ctx.payload.update({
          collection: 'media',
          id: image.id,
          locale,
          data: { caption: image.caption } as never,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
      }
      out.push({
        blockType: 'gallery',
        background: block.background,
        title: gallery.title,
        intro: gallery.intro,
        source: 'pictures',
        images: gallery.images.map((image) => image.id),
      })
      turned++
    }
  }
  if (turned === 0) ctx.report.add('skipped', legacyId, 'named as a photo page, but no text on it reads as photos with captions')
  return out
}

function enPath(plan: PagePlan): string | undefined {
  if (!plan.enSegments) return undefined
  return plan.key === 'home' ? '/' : `/${plan.enSegments.join('/')}`
}

async function importOne(ctx: Ctx, contentDir: string, plan: PagePlan): Promise<void> {
  const legacyId = `pages/${plan.key}`
  const parent = plan.parentKey ? ctx.ids.get(`pages/${plan.parentKey}`) : undefined
  const last = (segments: string[]) => segments[segments.length - 1]!
  const oldUrls: string[] = []
  const override = ctx.fixups.pageOverrides[plan.key]

  if (plan.placeholder) {
    const title = last(plan.enSegments ?? plan.nlSegments!)
    if (plan.enSegments) {
      await upsert(ctx, 'pages', legacyId, { title, slug: last(plan.enSegments), parent, _status: 'draft' }, 'en')
    }
    if (plan.nlSegments) {
      await upsert(ctx, 'pages', legacyId, { title, slug: last(plan.nlSegments), parent, _status: 'draft' }, 'nl')
    }
  } else {
    if (plan.enFile) {
      const en = await localeData(ctx, contentDir, plan.enFile, last(plan.enSegments!), plan.key)
      oldUrls.push(...en.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...en.data, ...override?.en, parent, _status: 'published' }, 'en')
    }
    if (plan.nlFile) {
      const nl = await localeData(ctx, contentDir, plan.nlFile, last(plan.nlSegments!), plan.key)
      oldUrls.push(...nl.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...nl.data, ...override?.nl, parent, _status: 'published' }, 'nl')
    }
  }

  const id = ctx.ids.get(legacyId)!
  const target = enPath(plan)
  // A menu item links to a page only when the page is real and no built-in route owns the address.
  if (target && !plan.placeholder && !ctx.reservedPaths.has(target)) ctx.pageByEnPath.set(target, id)

  for (const from of oldUrls) {
    if (!target || !from.startsWith('/')) continue
    const existing = await ctx.payload.find({
      collection: 'redirects',
      where: { and: [{ from: { equals: from } }, { tenant: { equals: ctx.tenantId } }] },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs === 0) {
      await ctx.payload.create({
        collection: 'redirects',
        data: { from, to: target, permanent: true, note: 'Previous URL of a page', tenant: ctx.tenantId } as never,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
  }
}

/** Deletes a page that an earlier run imported and a fix-up now removes. */
async function removeImported(ctx: Ctx, key: string): Promise<void> {
  const existing = await ctx.payload.find({
    collection: 'pages',
    where: { and: [{ legacyId: { equals: `pages/${key}` } }, { tenant: { equals: ctx.tenantId } }] },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const doc = existing.docs[0]
  if (!doc) return
  await ctx.payload.delete({
    collection: 'pages',
    id: doc.id,
    overrideAccess: true,
    context: { disableRevalidate: true, skipResave: true },
  })
}

export async function importPages(ctx: Ctx, contentDir: string): Promise<void> {
  // Plan into a scratch report first, so entries about removed pages can be replaced.
  const scratch = new Report()
  const all = planPages(listContent(contentDir, 'pages'), scratch, ctx.fixups.segments)
  // A page with no blocks and no text has nothing on it.
  const hasNothing = (plan: PagePlan) =>
    [plan.enFile, plan.nlFile].every((file) => {
      if (!file) return true
      const f = readTinaFile(contentDir, file)
      return !(Array.isArray(f.data.blocks) && f.data.blocks.length > 0) && !f.body?.trim()
    })
  // Pages a fix-up removes anyway do not keep an empty page above them alive.
  const staying = all.filter((plan) => !ctx.fixups.removePages.includes(plan.key))
  const emptyKeys = ctx.fixups.skipEmptyPages ? new Set(emptyKeysToSkip(staying, hasNothing)) : new Set<string>()
  const removed = all.filter((plan) => ctx.fixups.removePages.includes(plan.key) || emptyKeys.has(plan.key))
  const removedFiles = new Set(removed.flatMap((plan) => [plan.enFile, plan.nlFile].filter((f): f is string => Boolean(f))))
  for (const entry of scratch.entries) {
    if (!removedFiles.has(entry.legacyId)) ctx.report.add(entry.kind, entry.legacyId, entry.message)
  }
  const emptyFiles = new Set(all.filter((plan) => emptyKeys.has(plan.key)).flatMap((plan) => [plan.enFile, plan.nlFile]))
  for (const file of removedFiles) ctx.report.add('skipped', file, emptyFiles.has(file) ? 'nothing on this page' : 'removed by a fix-up')
  for (const plan of removed) {
    try {
      await removeImported(ctx, plan.key)
    } catch (err) {
      ctx.report.add('error', `pages/${plan.key}`, `could not remove: ${(err as Error).message}`)
    }
  }

  const plans = all.filter((plan) => !ctx.fixups.removePages.includes(plan.key) && !emptyKeys.has(plan.key))
  for (const plan of plans) {
    try {
      await importOne(ctx, contentDir, plan)
    } catch (err) {
      ctx.report.add('error', plan.enFile ?? plan.nlFile ?? `pages/${plan.key}`, (err as Error).message)
    }
  }
}
