import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Ctx } from './context'
import { resolveMedia } from './media'
import { listContent, readTinaFile } from './read'

type Raw = Record<string, any>
const WRITE = { overrideAccess: true, context: { disableRevalidate: true } } as const
const SETTINGS_FILE = 'global/index.json'

/** Links to a page when the href is exactly a known English page path. */
function link(ctx: Ctx, item: Raw) {
  return { page: ctx.pageByEnPath.get(item.href), href: item.href, label: item.label }
}

function navItem(ctx: Ctx, item: Raw, locale: 'en' | 'nl'): Raw {
  return {
    ...link(ctx, item),
    labelText: locale === 'en' ? item.labelEn : item.labelNl,
    submenu: ((item.submenu ?? []) as Raw[]).map((sub) => ({
      ...link(ctx, sub),
      labelText: locale === 'en' ? sub.labelEn : sub.labelNl,
    })),
  }
}

export async function importSettings(ctx: Ctx, contentDir: string): Promise<void> {
  if (!existsSync(path.join(contentDir, SETTINGS_FILE))) {
    ctx.report.add('skipped', SETTINGS_FILE, 'no global settings file')
    return
  }
  try {
    const d = readTinaFile(contentDir, SETTINGS_FILE).data
    const base = (locale: 'en' | 'nl') => ({
      header: {
        logo: resolveMedia(ctx, d.header?.logo, SETTINGS_FILE),
        logoAlt: d.header?.logoAlt ?? d.header?.name ?? 'Logo',
        name: d.header?.name ?? '',
        color: d.header?.color,
        nav: ((d.header?.nav ?? []) as Raw[]).map((item) => navItem(ctx, item, locale)),
      },
      homepage: { showCalendarWidget: Boolean(d.homepage?.showCalendarWidget) },
      footer: {
        social: ((d.footer?.social ?? []) as Raw[]).map((s) => ({ platform: s.platform, url: s.url })),
        quickLinks: ((d.footer?.quickLinks ?? []) as Raw[]).map((q) => ({
          title: q.title,
          links: ((q.links ?? []) as Raw[]).map((l) => link(ctx, l)),
        })),
      },
      theme: { color: d.theme?.color, font: d.theme?.font, darkMode: d.theme?.darkMode },
    })

    const existing = await ctx.payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: ctx.tenantId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = existing.docs[0] as { id: number | string } | undefined
    const saved = found
      ? await ctx.payload.update({
          collection: 'site-settings',
          id: found.id,
          locale: 'en',
          data: base('en') as never,
          ...WRITE,
        })
      : await ctx.payload.create({
          collection: 'site-settings',
          locale: 'en',
          data: { ...base('en'), tenant: ctx.tenantId } as never,
          ...WRITE,
        })

    // Dutch labels live on the same array rows, so the rows are addressed by id.
    const hasDutch = ((d.header?.nav ?? []) as Raw[]).some(
      (item) => item.labelNl || ((item.submenu ?? []) as Raw[]).some((s) => s.labelNl),
    )
    if (hasDutch) {
      const savedNav = ((saved as Raw).header?.nav ?? []) as Raw[]
      const nlNav = base('nl').header.nav.map((item, i) => ({
        ...item,
        id: savedNav[i]?.id,
        submenu: (item.submenu as Raw[]).map((sub, j) => ({ ...sub, id: savedNav[i]?.submenu?.[j]?.id })),
      }))
      await ctx.payload.update({
        collection: 'site-settings',
        id: (saved as { id: number | string }).id,
        locale: 'nl',
        data: { header: { nav: nlNav } } as never,
        ...WRITE,
      })
    }
  } catch (err) {
    ctx.report.add('error', SETTINGS_FILE, (err as Error).message)
  }
}

export async function importRedirects(ctx: Ctx, contentDir: string): Promise<void> {
  for (const rel of listContent(contentDir, 'redirects')) {
    try {
      const d = readTinaFile(contentDir, rel).data
      const existing = await ctx.payload.find({
        collection: 'redirects',
        where: { and: [{ from: { equals: d.from } }, { tenant: { equals: ctx.tenantId } }] },
        limit: 1,
        overrideAccess: true,
      })
      const data = { from: d.from, to: d.to, permanent: Boolean(d.permanent), note: d.note }
      if (existing.docs[0]) {
        await ctx.payload.update({ collection: 'redirects', id: existing.docs[0].id, data: data as never, ...WRITE })
      } else {
        await ctx.payload.create({
          collection: 'redirects',
          data: { ...data, tenant: ctx.tenantId } as never,
          ...WRITE,
        })
      }
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
}
