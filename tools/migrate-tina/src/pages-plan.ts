import type { Report } from './report'
import { pageSlug } from './slug'

/** English to Dutch URL segments, copied from the old catch-all page route. */
export const SEGMENT_NL: Record<string, string> = {
  'about-us': 'over-ons',
  activities: 'activiteiten',
  news: 'nieuws',
  vacancies: 'vacatures',
  library: 'bibliotheek',
  newsletters: 'nieuwsbrieven',
  newsletter: 'nieuwsbrief',
  'what-is-boerengroep': 'wat-is-boerengroep',
  history: 'geschiedenis',
  'who-are-we': 'wie-zijn-wij',
  network: 'netwerk',
  calendar: 'agenda',
  'past-events': 'terugblik',
  'group-studies': 'groepsstudies',
  teachers: 'docenten',
  'forum-reader': 'forumlezer',
  'soup-kitchen': 'soepkeuken',
  'calendar-sections': 'agenda-secties',
  'friends-news': 'vrienden-nieuws',
  '50-years-bg': '50-jaar-bg',
  archive: 'archief',
  'privacy-policy': 'privacybeleid',
  'terms-conditions': 'algemene-voorwaarden',
  accessibility: 'toegankelijkheid',
  events: 'evenementen',
  'export-data': 'exporteer-gegevens',
  'delete-data': 'verwijder-gegevens',
  // Not in the old route table. Found in the content folders.
  breaks: 'pauzes',
  // Editors renamed the English page in 2026. The Dutch file kept its old name.
  'open-pot-student-kitchen': 'soepkeuken',
  'open-meetings': 'open-vergaderingen',
}

const SEGMENT_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SEGMENT_NL).map(([en, nl]) => [nl, en]),
)

export type PagePlan = {
  key: string
  enFile?: string
  nlFile?: string
  enSegments?: string[]
  nlSegments?: string[]
  parentKey?: string
  placeholder: boolean
}

type Source = { file: string; segments: string[] }

/**
 * Every Dutch spelling an English path may have on disk: each segment either
 * translated or left as it is. The fully translated spelling comes first.
 */
function dutchCandidates(segments: string[], words: Record<string, string>): string[] {
  let paths: string[][] = [[]]
  for (const segment of segments) {
    const translated = words[segment]
    paths = paths.flatMap((prefix) =>
      translated && translated !== segment ? [[...prefix, translated], [...prefix, segment]] : [[...prefix, segment]],
    )
  }
  return paths.map((p) => p.join('/'))
}

/** Normalises the files of one locale to a map of path to source file. */
function collect(files: string[], locale: 'en' | 'nl', report: Report): Map<string, Source> {
  const prefix = `pages/${locale}/`
  const direct = new Map<string, Source>()
  const index = new Map<string, Source>()
  let rootIndex: string | undefined

  for (const file of files) {
    if (!file.startsWith(prefix)) continue
    const raw = file.slice(prefix.length).replace(/\.mdx?$/, '').split('/')
    const isIndex = raw[raw.length - 1] === 'index'
    const parts = isIndex ? raw.slice(0, -1) : raw
    if (parts.length === 0) {
      rootIndex = file
      continue
    }
    const segments = parts.map((part) => {
      const slug = pageSlug(part)
      if (slug !== part) report.add('slug-changed', file, `segment "${part}" becomes "${slug}"`)
      return slug
    })
    ;(isIndex ? index : direct).set(segments.join('/'), { file, segments })
  }

  const out = new Map(direct)
  for (const [p, source] of index) {
    const winner = direct.get(p)
    if (winner) report.add('shadowed-file', source.file, `not imported: ${winner.file} serves the same URL`)
    else out.set(p, source)
  }
  if (rootIndex) {
    const home = out.get('home')
    if (home) report.add('shadowed-file', rootIndex, `not imported: ${home.file} is the home page`)
    else out.set('home', { file: rootIndex, segments: ['home'] })
  }
  return out
}

/**
 * @param extra  A site's own English to Dutch address words, laid over the shared list.
 */
export function planPages(files: string[], report: Report, extra: Record<string, string> = {}): PagePlan[] {
  const words = { ...SEGMENT_NL, ...extra }
  const english = { ...SEGMENT_EN, ...Object.fromEntries(Object.entries(extra).map(([en, nl]) => [nl, en])) }
  for (const file of files) {
    if (file.startsWith('pages/') && !file.startsWith('pages/en/') && !file.startsWith('pages/nl/')) {
      report.add('skipped', file, 'outside a locale folder')
    }
  }

  const en = collect(files, 'en', report)
  const nl = collect(files, 'nl', report)
  const plans = new Map<string, PagePlan>()

  for (const [key, source] of en) {
    const match = dutchCandidates(source.segments, words).find((candidate) => nl.has(candidate))
    const partner = match === undefined ? undefined : nl.get(match)
    if (partner) nl.delete(partner.segments.join('/'))
    else report.add('unpaired-locale', source.file, 'no Dutch counterpart')
    plans.set(key, {
      key,
      enFile: source.file,
      enSegments: source.segments,
      nlFile: partner?.file,
      nlSegments: partner?.segments,
      placeholder: false,
    })
  }

  for (const source of nl.values()) {
    const key = source.segments.map((s) => english[s] ?? s).join('/')
    const existing = plans.get(key)
    if (existing) {
      // A second Dutch file for a page that is already planned, usually a stray copy.
      report.add('shadowed-file', source.file, `not imported: same page as ${existing.nlFile ?? existing.enFile}`)
      continue
    }
    report.add('unpaired-locale', source.file, 'no English counterpart')
    plans.set(key, { key, nlFile: source.file, nlSegments: source.segments, placeholder: false })
  }

  // Add placeholders for folders without their own page, deepest first so chains resolve.
  const queue = [...plans.values()]
  while (queue.length > 0) {
    const plan = queue.shift()!
    const keyParts = plan.key.split('/')
    if (keyParts.length < 2) continue
    const parentKey = keyParts.slice(0, -1).join('/')
    plan.parentKey = parentKey
    if (plans.has(parentKey)) continue
    const depth = keyParts.length - 1
    const placeholder: PagePlan = {
      key: parentKey,
      enSegments: plan.enSegments?.slice(0, depth) ?? keyParts.slice(0, depth),
      nlSegments: plan.nlSegments?.slice(0, depth),
      placeholder: true,
    }
    plans.set(parentKey, placeholder)
    queue.push(placeholder)
    report.add('placeholder-parent', plan.enFile ?? plan.nlFile ?? `pages/${plan.key}`, `created a draft page for /${parentKey}`)
  }

  // A placeholder created from an English-only child may still lack Dutch segments
  // that a later sibling can provide.
  for (const plan of plans.values()) {
    if (!plan.parentKey) continue
    const parent = plans.get(plan.parentKey)
    if (parent?.placeholder && !parent.nlSegments && plan.nlSegments) {
      parent.nlSegments = plan.nlSegments.slice(0, plan.key.split('/').length - 1)
    }
  }

  return [...plans.values()].sort(
    (a, b) => a.key.split('/').length - b.key.split('/').length || a.key.localeCompare(b.key),
  )
}

/**
 * The pages to leave out because nothing is on them. A page with nothing of its own stays
 * when a page with content sits under it, because that page needs it in its address. The home
 * page always stays.
 */
export function emptyKeysToSkip(plans: PagePlan[], isEmpty: (plan: PagePlan) => boolean): string[] {
  const empty = plans.filter((plan) => plan.key !== 'home' && !plan.placeholder && isEmpty(plan))
  const emptyKeys = new Set(empty.map((plan) => plan.key))
  const kept = plans.filter((plan) => !emptyKeys.has(plan.key) && !plan.placeholder).map((plan) => plan.key)
  return empty.filter((plan) => !kept.some((key) => key.startsWith(`${plan.key}/`))).map((plan) => plan.key)
}
