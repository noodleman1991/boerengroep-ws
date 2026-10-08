import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import type { PayloadRequest, Where } from 'payload'

/** One line per kind of content, in the words of someone who edits the website. */
const WHAT: Record<string, string> = {
  pages: 'The pages of the website. Each is built from blocks.',
  events: 'What is on the calendar.',
  'past-events': 'How an event went, with the photos of the day.',
  'event-kinds': 'Talk, excursion, course: the kinds visitors can filter the calendar by.',
  newsletters: 'Your own news and news from friends, in one list.',
  vacancies: 'Volunteers, interns and board members wanted.',
  media: 'Every picture and file that was uploaded.',
  speakers: 'People named at events.',
  authors: 'People who write stories and news.',
  tags: 'Words to group stories by.',
  forms: 'Forms you made for visitors to fill in.',
  'form-submissions': 'What visitors filled in.',
  'site-settings': 'Logo, menu, footer, newsletter box and calendar options.',
  redirects: 'Old web addresses that lead on to a new one.',
  users: 'Who can log in, and what each person may do.',
  tenants: 'The websites that are looked after from here.',
}

/** Kinds of content that do not belong to one website. */
const SHARED = ['users', 'tenants']
/** One item per website: there is nothing to count or to add. */
const SINGLE = ['site-settings']

type Props = { req: PayloadRequest; permissions?: { collections?: Record<string, { read?: unknown; create?: unknown } | undefined> } }

const plain = (label: unknown): string =>
  typeof label === 'string' ? label : label && typeof label === 'object' ? String(Object.values(label)[0] ?? '') : ''

/**
 * The first screen under the welcome: every kind of content of the chosen website, what it is,
 * and how much of it there is. An empty kind says so, which answers "where did it all go?"
 * when the other website is the one that has it.
 */
export async function SiteOverview({ req, permissions }: Props) {
  const { payload } = req
  const tenant = getTenantFromCookie(req.headers, payload.db.defaultIDType)
  const site = tenant
    ? await payload.findByID({ collection: 'tenants', id: tenant, depth: 0, overrideAccess: true }).catch(() => null)
    : null
  const admin = payload.config.routes.admin
  const allowed = (slug: string, what: 'read' | 'create') => Boolean(permissions?.collections?.[slug]?.[what])

  const count = async (slug: string, extra?: Where): Promise<number | null> => {
    const where: Where[] = []
    if (tenant && !SHARED.includes(slug)) where.push({ tenant: { equals: tenant } })
    if (extra) where.push(extra)
    try {
      const res = await payload.count({ collection: slug as never, where: where.length ? { and: where } : undefined, overrideAccess: false, req })
      return res.totalDocs
    } catch {
      return null
    }
  }

  const groups = new Map<string, { slug: string; name: string; total: number | null; note?: string }[]>()
  for (const collection of payload.config.collections) {
    const slug = collection.slug
    if (!WHAT[slug] || !allowed(slug, 'read')) continue
    const group = plain(collection.admin?.group) || 'Other'
    const total = SINGLE.includes(slug) ? null : await count(slug)
    let note: string | undefined
    if (slug === 'newsletters' && total) {
      const friends = await count(slug, { organization: { equals: 'friends' } })
      if (friends !== null) note = `${total - friends} your own, ${friends} from friends`
    }
    groups.set(group, [...(groups.get(group) ?? []), { slug, name: plain(collection.labels?.plural) || slug, total, note }])
  }

  return (
    <section className="site-overview" aria-labelledby="site-overview-title">
      <h2 id="site-overview-title">{site ? `Everything on ${(site as { name?: string }).name}` : 'Everything on both websites'}</h2>
      {!site && <p className="site-overview__hint">Choose a website at the top to see only what belongs to it.</p>}
      {[...groups].map(([group, rows]) => (
        <div className="site-overview__group" key={group}>
          <h3>{group}</h3>
          <ul>
            {rows.map((row) => (
              <li key={row.slug} className={row.total === 0 ? 'site-overview__row site-overview__row--empty' : 'site-overview__row'}>
                <a className="site-overview__name" href={`${admin}/collections/${row.slug}`}>
                  {row.name}
                </a>
                <span className="site-overview__what">{WHAT[row.slug]}</span>
                <span className="site-overview__count">
                  {row.total === null ? '' : row.total === 0 ? 'Nothing yet' : row.total}
                  {row.note && <small>{row.note}</small>}
                </span>
                {!SINGLE.includes(row.slug) && allowed(row.slug, 'create') ? (
                  <a className="site-overview__add" href={`${admin}/collections/${row.slug}/create`}>
                    Add<span className="site-overview__sr"> to {row.name}</span>
                  </a>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
