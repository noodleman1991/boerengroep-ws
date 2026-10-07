import { describe, expect, it } from 'vitest'
import { Report } from './report'

describe('Report', () => {
  it('counts entries by kind', () => {
    const r = new Report()
    r.add('missing-media', 'pages/en/home.mdx', '/uploads/x.jpg not found')
    r.add('missing-media', 'pages/en/a.mdx', '/uploads/y.jpg not found')
    r.add('unpaired-locale', 'pages/nl/b.mdx', 'no English counterpart')
    expect(r.count()).toBe(3)
    expect(r.count('missing-media')).toBe(2)
  })

  it('fails only when an error was recorded', () => {
    const r = new Report()
    r.add('inline-image', 'a', 'x')
    expect(r.failed).toBe(false)
    r.add('error', 'b', 'boom')
    expect(r.failed).toBe(true)
  })

  it('renders a markdown section per kind with errors first', () => {
    const r = new Report()
    r.add('skipped', 'pages/about.mdx', 'outside a locale folder')
    r.add('error', 'events/en/x.mdx', 'startDate missing')
    const md = r.toMarkdown()
    expect(md.indexOf('## error (1)')).toBeLessThan(md.indexOf('## skipped (1)'))
    expect(md).toContain('- `events/en/x.mdx`: startDate missing')
  })

  it('says so when there is nothing to report', () => {
    expect(new Report().toMarkdown()).toContain('Nothing to report.')
  })
})
