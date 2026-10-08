import { expect, test } from '@playwright/test'

// What makes this the Inspringtheater site: its own content, menu, colours and address rules.
// Some checks name content of the import, such as the History page.

test('the home page is the Inspringtheater one, in both languages', async ({ page }) => {
  await page.goto('/en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Inspringtheater')
  await expect(page).toHaveTitle(/Inspringtheater/)
  await page.goto('/nl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl')
})

test('the logo is the Inspringtheater logo, in the header and in the footer', async ({ page }) => {
  await page.goto('/en')
  for (const where of ['.site-header__logo img', '.site-footer__brand img']) {
    const logo = page.locator(where)
    await expect(logo).toBeVisible()
    expect(await logo.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0), where).toBe(true)
    await expect(logo).toHaveAttribute('alt', /Inspringtheater/)
  }
})

test('the site wears its own colours: orange leads, on a warm dark footer', async ({ page }) => {
  await page.goto('/en')
  const colours = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return { leaf: style.getPropertyValue('--leaf').trim(), furrow: style.getPropertyValue('--furrow').trim() }
  })
  expect(colours).toEqual({ leaf: '#ff7a00', furrow: '#33200f' })
})

test('the menu has readable labels and leads to real pages', async ({ page }) => {
  await page.goto('/en')
  const nav = page.locator('.site-nav')
  await expect(nav).toContainText('About Inspringtheater')
  // No label is a leftover internal key such as "about-inspringtheater".
  const labels = await nav.locator('.site-nav__item').allTextContents()
  expect(labels.filter((label) => /^[a-z]+(-[a-z]+)+$/.test(label.trim()))).toEqual([])
  await nav.locator('.site-nav__item[aria-expanded]').first().click()
  await page.locator('.site-nav__panel a', { hasText: 'History' }).click()
  await expect(page).toHaveURL(/\/en\/about-inspringtheater\/history$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('History')
})

test('a page has its own Dutch address, and the old English one under /nl still arrives', async ({ page }) => {
  await page.goto('/nl/about-inspringtheater/history')
  await expect(page).toHaveURL(/\/nl\/over-inspringtheater\/geschiedenis$/)
})

test('the old agenda address leads to the calendar', async ({ page }) => {
  await page.goto('/en/agenda')
  await expect(page).toHaveURL(/\/en\/activities\/calendar$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the calendar shows this site’s events and its own kinds', async ({ page }) => {
  await page.goto('/en/activities/calendar?view=past')
  expect(await page.locator('.event-row').count()).toBeGreaterThan(5)
  const kinds = await page.locator('.calendar .chip').allTextContents()
  expect(kinds.join(' ')).toMatch(/Jump-in Session/)
  expect(kinds.join(' ')).not.toMatch(/Open Pot|CSA/)
  await page.goto('/nl/activities/calendar?view=past')
  await expect(page.locator('.calendar .chip', { hasText: 'Inspringsessie' })).toHaveCount(1)
})

test('nothing of the other site leaks in', async ({ page, request }) => {
  // A Boerengroep page does not exist here.
  expect((await request.get('/en/about-us/what-is-boerengroep')).status()).toBe(404)
  const feed = await (await request.get('/calendar.ics')).text()
  expect(feed).toContain('BEGIN:VCALENDAR')
  expect(feed).not.toContain('Boerengroep Break')
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/en/about-inspringtheater/history')
  expect(sitemap).not.toContain('what-is-boerengroep')
})

test('the built-in lists do not speak of the other site either', async ({ page }) => {
  for (const path of ['/en/news', '/en/news/newsletter', '/en/news/friends-news', '/nl/news/newsletter']) {
    await page.goto(path)
    await expect(page.locator('main'), path).not.toContainText(/Boerengroep|agricultur|landbouw/i)
  }
})

test('the sitemap does not offer lists that have nothing in them', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  const paths = [...xml.matchAll(/<loc>[^<]*?\/(en|nl)(\/[^<]*)?<\/loc>/g)].map((match) => match[2] ?? '/')
  expect(paths).toContain('/activities/calendar')
  // This site has no news, no stories, no podcast and no vacancies yet.
  for (const empty of ['/news', '/news/newsletter', '/news/friends-news', '/library/podcast', '/vacancies', '/activities/past-events']) {
    expect(paths, empty).not.toContain(empty)
  }
})

test('addresses the old site still answered on lead to a page, not to "not found"', async ({ page }) => {
  // Left over from the site this one was copied from. Each leads to the closest page that exists.
  const moved: [string, RegExp][] = [
    ['/en/about-us', /\/en\/about-inspringtheater$/],
    ['/nl/over-ons/geschiedenis', /\/nl\/over-inspringtheater$/],
    ['/en/activities/pei', /\/en\/activities$/],
    ['/nl/activiteiten/agenda', /\/nl\/activities\/calendar$/],
    ['/en/jobs', /\/en\/get-involved$/],
    ['/nl/bibliotheek/podcast', /\/nl$/],
    ['/en/privacy-policy', /\/en$/],
  ]
  for (const [from, to] of moved) {
    const res = await page.goto(from)
    expect(res?.status(), from).toBe(200)
    await expect(page, from).toHaveURL(to)
  }
})

test('typing /admin sends an editor to the one admin panel', async ({ request }) => {
  const res = await request.get('/admin', { maxRedirects: 0 })
  expect(res.status()).toBe(307)
  expect(res.headers().location).toMatch(/\/admin$/)
})

test('a preview link is only accepted with a valid signature', async ({ request }) => {
  const forged = await request.get('/api/preview?path=%2Fen&exp=99999999999999&sig=' + '0'.repeat(64), { maxRedirects: 0 })
  expect(forged.status()).toBe(403)
  const unsigned = await request.get('/api/preview?path=%2Fen', { maxRedirects: 0 })
  expect(unsigned.status()).toBe(401)
})

test('pictures of the content load', async ({ page }) => {
  await page.goto('/en/about-inspringtheater/history')
  const picture = page.locator('main img').first()
  await picture.scrollIntoViewIfNeeded()
  await expect.poll(() => picture.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true)
})
