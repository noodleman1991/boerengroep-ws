import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Automated accessibility checks (WCAG 2.1 A and AA) on each kind of page. They catch
 * contrast, missing names, wrong roles and the like. They do not replace trying the site
 * with a keyboard and a screen reader.
 */
const pages = [
  '/en',
  '/nl',
  '/en/activities/calendar',
  '/en/activities/calendar?view=month',
  '/en/activities/past-events',
  '/en/news/friends-news',
  '/en/vacancies',
  '/en/about-us/history',
  '/en/newsletter/delete-data',
  '/en/block-examples',
]

for (const path of pages) {
  test(`no accessibility problems on ${path}`, async ({ page }) => {
    const res = await page.goto(path)
    test.skip(res?.status() !== 200, 'this page does not exist here')
    await page.waitForTimeout(600)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const problems = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}x, for example ${v.nodes[0]?.target.join(' ')}`)
    expect(problems).toEqual([])
  })
}
