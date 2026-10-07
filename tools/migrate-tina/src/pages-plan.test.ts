import { describe, expect, it } from 'vitest'
import { planPages } from './pages-plan'
import { Report } from './report'

const byKey = (plans: ReturnType<typeof planPages>) => Object.fromEntries(plans.map((p) => [p.key, p]))

describe('planPages', () => {
  it('pairs English and Dutch files through the segment table', () => {
    const report = new Report()
    const plans = byKey(
      planPages(
        [
          'pages/en/about-us/index.mdx',
          'pages/en/about-us/history.mdx',
          'pages/nl/over-ons/index.mdx',
          'pages/nl/over-ons/geschiedenis.mdx',
        ],
        report,
      ),
    )
    expect(plans['about-us']).toMatchObject({
      enFile: 'pages/en/about-us/index.mdx',
      nlFile: 'pages/nl/over-ons/index.mdx',
      enSegments: ['about-us'],
      nlSegments: ['over-ons'],
      placeholder: false,
    })
    expect(plans['about-us/history']).toMatchObject({
      nlFile: 'pages/nl/over-ons/geschiedenis.mdx',
      nlSegments: ['over-ons', 'geschiedenis'],
      parentKey: 'about-us',
    })
    expect(report.count()).toBe(0)
  })

  it('pairs files whose path is the same in both languages', () => {
    const plans = byKey(planPages(['pages/en/contact.mdx', 'pages/nl/contact.mdx'], new Report()))
    expect(plans.contact).toMatchObject({ enSegments: ['contact'], nlSegments: ['contact'] })
  })

  it('pairs files when only some segments are translated', () => {
    const report = new Report()
    const plans = byKey(
      planPages(
        ['pages/en/news/friends-news.mdx', 'pages/nl/nieuws/friends-news.mdx', 'pages/en/news/newsletter.mdx', 'pages/nl/nieuws/newsletter.mdx'],
        report,
      ),
    )
    expect(plans['news/friends-news']).toMatchObject({
      enFile: 'pages/en/news/friends-news.mdx',
      nlFile: 'pages/nl/nieuws/friends-news.mdx',
      nlSegments: ['nieuws', 'friends-news'],
    })
    expect(plans['news/newsletter']?.nlFile).toBe('pages/nl/nieuws/newsletter.mdx')
    expect(report.count('unpaired-locale')).toBe(0)
  })

  it('prefers the fully translated path when both variants exist', () => {
    const plans = byKey(
      planPages(
        ['pages/en/news/newsletter.mdx', 'pages/nl/nieuws/newsletter.mdx', 'pages/nl/nieuws/nieuwsbrief.mdx'],
        new Report(),
      ),
    )
    expect(plans['news/newsletter']?.nlFile).toBe('pages/nl/nieuws/nieuwsbrief.mdx')
  })

  it('pairs the calendar section pages by their Dutch names', () => {
    const report = new Report()
    const plans = byKey(
      planPages(
        [
          'pages/en/activities/calendar-sections/breaks.mdx',
          'pages/nl/activiteiten/agenda-secties/pauzes.mdx',
          'pages/en/activities/calendar-sections/open-meetings.mdx',
          'pages/nl/activiteiten/agenda-secties/open-vergaderingen.mdx',
        ],
        report,
      ),
    )
    expect(plans['activities/calendar-sections/breaks']?.nlSegments).toEqual(['activiteiten', 'agenda-secties', 'pauzes'])
    expect(plans['activities/calendar-sections/open-meetings']?.nlSegments).toEqual([
      'activiteiten',
      'agenda-secties',
      'open-vergaderingen',
    ])
    expect(report.count('unpaired-locale')).toBe(0)
  })

  it('does not let a stray Dutch copy overwrite a paired page', () => {
    const report = new Report()
    const plans = byKey(
      planPages(
        [
          'pages/en/library/index.mdx',
          'pages/nl/bibliotheek/index.mdx',
          'pages/en/library/agroecologie-netwerk.mdx',
          'pages/nl/bibliotheek/agroecologie-netwerk.mdx',
          'pages/nl/library/agroecologie-netwerk.mdx',
        ],
        report,
      ),
    )
    expect(plans['library/agroecologie-netwerk']).toMatchObject({
      enFile: 'pages/en/library/agroecologie-netwerk.mdx',
      nlFile: 'pages/nl/bibliotheek/agroecologie-netwerk.mdx',
      nlSegments: ['bibliotheek', 'agroecologie-netwerk'],
    })
    expect(report.entries).toEqual([
      {
        kind: 'shadowed-file',
        legacyId: 'pages/nl/library/agroecologie-netwerk.mdx',
        message: 'not imported: same page as pages/nl/bibliotheek/agroecologie-netwerk.mdx',
      },
    ])
  })

  it('treats root home files as the home page', () => {
    const plans = byKey(planPages(['pages/en/home.mdx', 'pages/nl/home.mdx'], new Report()))
    expect(plans.home).toMatchObject({ enSegments: ['home'], nlSegments: ['home'] })
    expect(plans.home?.parentKey).toBeUndefined()
  })

  it('reports a root index that is shadowed by home', () => {
    const report = new Report()
    const plans = planPages(['pages/en/home.mdx', 'pages/en/index.mdx'], report)
    expect(plans).toHaveLength(1)
    expect(report.entries).toEqual([
      { kind: 'shadowed-file', legacyId: 'pages/en/index.mdx', message: 'not imported: pages/en/home.mdx is the home page' },
      { kind: 'unpaired-locale', legacyId: 'pages/en/home.mdx', message: 'no Dutch counterpart' },
    ])
  })

  it('uses a root index as home when there is no home file', () => {
    const plans = byKey(planPages(['pages/en/index.mdx'], new Report()))
    expect(plans.home?.enFile).toBe('pages/en/index.mdx')
  })

  it('lets x.mdx win over x/index.mdx as the old route did', () => {
    const report = new Report()
    const plans = byKey(
      planPages(['pages/en/inspringtheater.mdx', 'pages/en/inspringtheater/index.mdx'], report),
    )
    expect(plans.inspringtheater?.enFile).toBe('pages/en/inspringtheater.mdx')
    expect(report.count('shadowed-file')).toBe(1)
  })

  it('adds a draft placeholder for a folder without its own page', () => {
    const report = new Report()
    const plans = planPages(
      [
        'pages/en/activities/index.mdx',
        'pages/en/activities/calendar-sections/breaks.mdx',
        'pages/nl/activiteiten/index.mdx',
        'pages/nl/activiteiten/agenda-secties/breaks.mdx',
      ],
      report,
    )
    const map = byKey(plans)
    expect(map['activities/calendar-sections']).toMatchObject({
      placeholder: true,
      enSegments: ['activities', 'calendar-sections'],
      nlSegments: ['activiteiten', 'agenda-secties'],
      parentKey: 'activities',
    })
    expect(map['activities/calendar-sections/breaks']?.parentKey).toBe('activities/calendar-sections')
    expect(report.count('placeholder-parent')).toBe(1)
  })

  it('orders parents before children', () => {
    const plans = planPages(
      ['pages/en/a/b/c.mdx', 'pages/en/a/index.mdx', 'pages/en/a/b/index.mdx'],
      new Report(),
    )
    expect(plans.map((p) => p.key)).toEqual(['a', 'a/b', 'a/b/c'])
  })

  it('imports a Dutch-only page under a key translated back to English', () => {
    const report = new Report()
    const plans = byKey(planPages(['pages/nl/over-ons/index.mdx', 'pages/nl/over-ons/vrijwilligers.mdx'], report))
    expect(plans['about-us/vrijwilligers']?.enFile).toBeUndefined()
    expect(plans['about-us/vrijwilligers']).toMatchObject({
      nlFile: 'pages/nl/over-ons/vrijwilligers.mdx',
      nlSegments: ['over-ons', 'vrijwilligers'],
      parentKey: 'about-us',
    })
    expect(report.count('unpaired-locale')).toBe(2)
  })

  it('reports an English page without a Dutch counterpart', () => {
    const report = new Report()
    planPages(['pages/en/accessibility.mdx'], report)
    expect(report.entries).toEqual([
      { kind: 'unpaired-locale', legacyId: 'pages/en/accessibility.mdx', message: 'no Dutch counterpart' },
    ])
  })

  it('skips files that are outside a locale folder', () => {
    const report = new Report()
    const plans = planPages(['pages/about.mdx', 'pages/test-page.en.mdx'], report)
    expect(plans).toEqual([])
    expect(report.count('skipped')).toBe(2)
  })

  it('reports a segment that had to change to become a valid slug', () => {
    const report = new Report()
    const plans = byKey(planPages(['pages/en/Our_Team.mdx'], report))
    expect(plans['our-team']?.enSegments).toEqual(['our-team'])
    expect(report.count('slug-changed')).toBe(1)
  })
})
