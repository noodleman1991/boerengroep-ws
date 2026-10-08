import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { openKind, PAGE_KINDS } from './pages'

/**
 * Accessibility checks on every kind of page, at desktop and phone size, with menus and
 * dialogs open, and with the keyboard alone. The automated rules cover WCAG 2.1 A and AA plus
 * common good practice (one main heading, landmarks, heading order). They do not replace
 * trying the site with a screen reader.
 */
const RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']

/** Waits until fades and slides are done. Measured halfway, a colour looks too faint. */
async function settled(page: Page) {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime as number))
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]),
  )
}

async function problems(page: Page, scope?: string): Promise<string[]> {
  await settled(page)
  let axe = new AxeBuilder({ page }).withTags(RULES)
  if (scope) axe = axe.include(scope)
  const results = await axe.analyze()
  return results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}x, for example ${v.nodes[0]?.target.join(' ')}`)
}

for (const size of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) {
  for (const kind of PAGE_KINDS) {
    test(`no accessibility problems, ${size.name}: ${kind.name}`, async ({ page }) => {
      await page.setViewportSize(size)
      test.skip(!(await openKind(page, kind)), 'this page does not exist in this database')
      await page.waitForTimeout(500)
      expect(await problems(page)).toEqual([])
      // Every page says once what it is, in the language it is written in, and has a title.
      await expect(page.locator('h1')).toHaveCount(1)
      expect(await page.locator('html').getAttribute('lang')).toMatch(/^(en|nl)$/)
      expect((await page.title()).trim().length).toBeGreaterThan(3)
    })
  }
}

test.describe('with things open', () => {
  test('an open menu in the header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/en')
    await page.locator('.site-nav__item[aria-expanded]').first().click()
    await expect(page.locator('.site-nav__panel')).toBeVisible()
    expect(await problems(page)).toEqual([])
  })

  test('the phone menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/en')
    await page.locator('.site-header__burger').click()
    await page.locator('.site-sheet__item[aria-expanded]').first().click()
    expect(await problems(page)).toEqual([])
  })

  test('the calendar menus: subscribe, add to calendar, share', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/en/activities/calendar')
    await page.getByRole('button', { name: 'Subscribe to our calendar' }).click()
    await expect(page.locator('.site-menu')).toBeVisible()
    expect(await problems(page)).toEqual([])
    await page.keyboard.press('Escape')
    const upcoming = page.locator('.event-row__title a')
    test.skip((await upcoming.count()) === 0, 'the content has no upcoming event right now')
    await upcoming.first().click()
    await page.getByRole('button', { name: 'Add to my calendar' }).click()
    await expect(page.locator('.site-menu')).toBeVisible()
    expect(await problems(page)).toEqual([])
  })

  test('an open vacancy and a chosen day in the month', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/en/vacancies')
    const vacancy = page.locator('details.vacancy').first()
    if (await vacancy.count()) {
      await vacancy.locator('summary').click()
      await expect(vacancy.locator('.vacancy__body')).toBeVisible()
      expect(await problems(page)).toEqual([])
    }
    await page.goto('/en/activities/calendar?view=month')
    const day = page.locator('button.month__tile').first()
    if (await day.count()) {
      await day.click()
      expect(await problems(page)).toEqual([])
    }
  })

  test('the newsletter box with an error and after signing up', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', (route) => route.fulfill({ json: { status: 'pending' } }))
    await page.goto('/en')
    const box = page.locator('.site-footer__news')
    await box.locator('input[type="email"]').fill('not-an-address')
    await box.getByRole('button').click()
    await expect(box.getByRole('alert')).toBeVisible()
    expect(await problems(page, '.site-footer__news')).toEqual([])
    await box.locator('input[type="email"]').fill('anna@example.org')
    await box.getByRole('button').click()
    await expect(box.getByRole('status')).toBeVisible()
    expect(await problems(page, '.site-footer__news')).toEqual([])
  })

  test('a photo opened large, a form with errors, and an item with its form open', async ({ page }) => {
    const res = await page.goto('/en/test-blocks')
    test.skip(res?.status() !== 200, 'the test page for blocks is not seeded here')
    await page.route((url) => /youtube|ytimg|vimeo/.test(url.hostname), (route) => route.abort())
    await page.getByRole('button', { name: /^Open photo \d+ of/ }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await problems(page, '.lightbox')).toEqual([])
    await page.keyboard.press('Escape')

    const form = page.locator('.form-block form')
    await form.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1700)
    await form.getByRole('button', { name: 'Send the test' }).click()
    await expect(form.getByText('Fill this in.').first()).toBeVisible()
    expect(await problems(page, '.form-block')).toEqual([])

    await page.locator('.item').getByRole('button', { name: 'Ask for one' }).click()
    expect(await problems(page, '.item')).toEqual([])
  })
})

test.describe('with the keyboard alone', () => {
  test('the first Tab offers to skip the menu, and Enter lands in the content', async ({ page }) => {
    await page.goto('/en/about-us/what-is-boerengroep')
    await page.keyboard.press('Tab')
    const skip = page.locator('.skip-link')
    await expect(skip).toBeFocused()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })

  test('whatever has the focus shows a clear ring', async ({ page }) => {
    await page.goto('/en')
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const ring = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement as Element)
        return { tag: (document.activeElement as Element).tagName, style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
      })
      expect(ring.style, `focus stop ${i + 1} (${ring.tag})`).not.toBe('none')
      expect(ring.width, `focus stop ${i + 1} (${ring.tag})`).toBeGreaterThanOrEqual(2)
    }
  })

  test('a header menu opens with Enter, and Escape closes it and gives the focus back', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/en')
    const trigger = page.locator('.site-nav__item[aria-expanded]').first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Tab')
    await expect(page.locator('.site-nav__panel a').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('tabbing out of an open header menu closes it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/en')
    const trigger = page.locator('.site-nav__item[aria-expanded]').first()
    await trigger.click()
    const links = page.locator('.site-nav__panel a')
    const count = await links.count()
    for (let i = 0; i <= count; i++) await page.keyboard.press('Tab')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('the phone menu keeps the page behind it out of reach, and Escape gives the focus back', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/en')
    const burger = page.locator('.site-header__burger')
    await burger.click()
    expect(await page.locator('main').evaluate((main) => (main as HTMLElement).inert)).toBe(true)
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.site-sheet, .site-header')))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.locator('.site-sheet')).toHaveCount(0)
    await expect(burger).toBeFocused()
    expect(await page.locator('main').evaluate((main) => (main as HTMLElement).inert)).toBe(false)
  })

  test('a photo opened large holds the focus, and Escape gives it back to the photo', async ({ page }) => {
    const res = await page.goto('/en/test-blocks')
    test.skip(res?.status() !== 200, 'the test page for blocks is not seeded here')
    const tile = page.getByRole('button', { name: /^Open photo \d+ of/ }).first()
    await tile.focus()
    await page.keyboard.press('Enter')
    const large = page.getByRole('dialog')
    await expect(large).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(large).toHaveCount(0)
    await expect(tile).toBeFocused()
  })
})

test('with less motion asked for, menus still open next to their button', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto('/en/activities/calendar')
  const button = page.getByRole('button', { name: 'Subscribe to our calendar' })
  await button.click()
  const menu = page.locator('.site-menu')
  await expect(menu).toBeVisible()
  // Directly under the button, not in a corner of the screen. The menu is placed a moment after it appears.
  await expect
    .poll(async () => {
      const [from, to] = [await button.boundingBox(), await menu.boundingBox()]
      return Math.abs(to!.y - (from!.y + from!.height))
    })
    .toBeLessThan(24)
  const [from, to] = [await button.boundingBox(), await menu.boundingBox()]
  expect(to!.x + to!.width).toBeGreaterThan(from!.x)
  await context.close()
})
