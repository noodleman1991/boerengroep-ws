import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Ctx } from './context'
import { labelFrom, parseHref } from './links'
import { resolveMedia } from './media'
import { listContent, readTinaFile } from './read'

type Raw = Record<string, any>
const WRITE = { overrideAccess: true, context: { disableRevalidate: true } } as const
const SETTINGS_FILE = 'global/index.json'

type Locale = 'en' | 'nl'

const PLATFORMS: Record<string, string> = {
  instagram: 'instagram',
  facebook: 'facebook',
  linkedin: 'linkedin',
  youtube: 'youtube',
  mastodon: 'mastodon',
  bluesky: 'bluesky',
  twitter: 'x',
  xtwitter: 'x',
  x: 'x',
}

/** One link in the new shape: where it goes, and what it says in this language. */
function link(ctx: Ctx, href: unknown, label: string | undefined): Raw {
  const target = parseHref(typeof href === 'string' ? href : undefined, ctx.pageByEnPath)
  return { ...(target ?? { linkType: 'custom', url: '' }), label }
}

function navLabel(ctx: Ctx, item: Raw, locale: Locale): string | undefined {
  const own = locale === 'en' ? item.labelEn : item.labelNl
  // An editor-written label wins. Otherwise the label comes from the old translation file.
  return own || labelFrom(ctx.messages[locale], ['navigation', 'items', item.label]) || item.labelEn || item.labelNl || item.label
}

function buildSettings(ctx: Ctx, d: Raw, locale: Locale): Raw {
  const m = ctx.messages[locale]
  const contact = (key: string[]) => labelFrom(m, ['footer', 'contact', ...key])
  const address = [contact(['address', 'street']), contact(['address', 'city'])].filter(Boolean).join('\n')
  const legacyLogo = resolveMedia(ctx, d.header?.logo, SETTINGS_FILE)
  const privacy = ctx.pageByEnPath.get('/privacy-policy')

  return {
    general: {
      name: d.header?.name || 'Site',
      logo: legacyLogo ?? (ctx.fixups.logo ? ctx.media.get(ctx.fixups.logo) : undefined),
      contact: { address: address || undefined, email: contact(['email']), phone: contact(['phone', 'display']) },
      social: ((d.footer?.social ?? []) as Raw[])
        .filter((s) => s?.url)
        .map((s) => ({ platform: PLATFORMS[String(s.platform ?? '').toLowerCase()] ?? 'other', url: s.url })),
    },
    header: {
      nav: ((d.header?.nav ?? []) as Raw[]).map((item) => ({
        ...link(ctx, item.href, navLabel(ctx, item, locale)),
        children: ((item.submenu ?? []) as Raw[]).map((sub) => link(ctx, sub.href, navLabel(ctx, sub, locale))),
      })),
    },
    footer: {
      columns: ((d.footer?.quickLinks ?? []) as Raw[]).map((column) => ({
        title: labelFrom(m, ['footer', 'quick-links', column.title, 'title']) ?? column.title,
        links: ((column.links ?? []) as Raw[]).map((l) =>
          link(
            ctx,
            l.href,
            labelFrom(m, ['footer', 'quick-links', column.title, 'links', l.label]) ??
              labelFrom(m, ['navigation', 'items', l.label]) ??
              l.label,
          ),
        ),
      })),
      legalLinks: privacy
        ? [{ linkType: 'page', page: privacy, label: labelFrom(m, ['footer', 'legal', 'privacy']) ?? 'Privacy' }]
        : [],
      showNewsletter: true,
    },
  }
}

/** Copies row ids from a saved document onto the same rows in another language. */
function withRowIds(next: Raw, saved: Raw): Raw {
  const zip = (rows: Raw[] | undefined, savedRows: Raw[] | undefined, child?: string) =>
    (rows ?? []).map((row, i) => {
      const out: Raw = { ...row, id: savedRows?.[i]?.id }
      if (child) out[child] = zip(row[child], savedRows?.[i]?.[child])
      return out
    })
  return {
    ...next,
    general: { ...next.general, social: zip(next.general.social, saved.general?.social) },
    header: { nav: zip(next.header.nav, saved.header?.nav, 'children') },
    footer: {
      ...next.footer,
      columns: zip(next.footer.columns, saved.footer?.columns, 'links'),
      legalLinks: zip(next.footer.legalLinks, saved.footer?.legalLinks),
    },
  }
}

export async function importSettings(ctx: Ctx, contentDir: string): Promise<void> {
  if (!existsSync(path.join(contentDir, SETTINGS_FILE))) {
    ctx.report.add('skipped', SETTINGS_FILE, 'no global settings file')
    return
  }
  try {
    const d = readTinaFile(contentDir, SETTINGS_FILE).data
    const existing = await ctx.payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: ctx.tenantId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = existing.docs[0] as { id: number | string } | undefined
    const english = buildSettings(ctx, d, 'en')
    const saved = (found
      ? await ctx.payload.update({ collection: 'site-settings', id: found.id, locale: 'en', data: english as never, depth: 0, ...WRITE })
      : await ctx.payload.create({
          collection: 'site-settings',
          locale: 'en',
          data: { ...english, tenant: ctx.tenantId } as never,
          depth: 0,
          ...WRITE,
        })) as Raw

    // Labels are per language but live on the same rows, so the Dutch pass addresses rows by id.
    await ctx.payload.update({
      collection: 'site-settings',
      id: saved.id,
      locale: 'nl',
      data: withRowIds(buildSettings(ctx, d, 'nl'), saved) as never,
      ...WRITE,
    })
  } catch (err) {
    ctx.report.add('error', SETTINGS_FILE, (err as Error).message)
  }
}

async function upsertRedirect(ctx: Ctx, data: { from: string; to: string; permanent: boolean; note?: string }) {
  const existing = await ctx.payload.find({
    collection: 'redirects',
    where: { and: [{ from: { equals: data.from } }, { tenant: { equals: ctx.tenantId } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    await ctx.payload.update({ collection: 'redirects', id: existing.docs[0].id, data: data as never, ...WRITE })
  } else {
    await ctx.payload.create({ collection: 'redirects', data: { ...data, tenant: ctx.tenantId } as never, ...WRITE })
  }
}

export async function importRedirects(ctx: Ctx, contentDir: string): Promise<void> {
  for (const rel of listContent(contentDir, 'redirects')) {
    try {
      const d = readTinaFile(contentDir, rel).data
      await upsertRedirect(ctx, { from: d.from, to: d.to, permanent: Boolean(d.permanent), note: d.note })
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
  for (const rule of ctx.fixups.redirects) {
    try {
      await upsertRedirect(ctx, { from: rule.from, to: rule.to, permanent: true, note: 'Added by a migration fix-up' })
    } catch (err) {
      ctx.report.add('error', `fixups:${rule.from}`, (err as Error).message)
    }
  }
}
