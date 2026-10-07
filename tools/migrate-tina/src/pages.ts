import { transformBlocks } from './blocks'
import { type Ctx, upsert } from './context'
import { planPages, type PagePlan } from './pages-plan'
import { listContent, readTinaFile } from './read'

async function localeData(ctx: Ctx, contentDir: string, file: string, slug: string) {
  const f = readTinaFile(contentDir, file)
  return {
    data: {
      title: f.data.title,
      slug,
      blocks: await transformBlocks(ctx, f.data.blocks, f.legacyId),
      body: await ctx.toLexical(f.body, f.legacyId),
    },
    previousUrls: (f.data.previousUrls ?? []) as string[],
  }
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
      const en = await localeData(ctx, contentDir, plan.enFile, last(plan.enSegments!))
      oldUrls.push(...en.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...en.data, parent, _status: 'published' }, 'en')
    }
    if (plan.nlFile) {
      const nl = await localeData(ctx, contentDir, plan.nlFile, last(plan.nlSegments!))
      oldUrls.push(...nl.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...nl.data, parent, _status: 'published' }, 'nl')
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

export async function importPages(ctx: Ctx, contentDir: string): Promise<void> {
  const plans = planPages(listContent(contentDir, 'pages'), ctx.report)
  for (const plan of plans) {
    try {
      await importOne(ctx, contentDir, plan)
    } catch (err) {
      ctx.report.add('error', plan.enFile ?? plan.nlFile ?? `pages/${plan.key}`, (err as Error).message)
    }
  }
}
