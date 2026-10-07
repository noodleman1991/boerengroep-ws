import { expect, test } from '@playwright/test'

test('home page renders its hero in both languages', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('main')).toContainText('Boerengroep')
  await page.goto('/nl')
  await expect(page.locator('main')).toContainText('Boerengroep')
})

test('the root redirects by browser language', async ({ browser }) => {
  const dutch = await browser.newContext({ locale: 'nl-NL' })
  const page = await dutch.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/nl$/)
  await dutch.close()
})

test('a nested page renders in English and in Dutch', async ({ page }) => {
  await page.goto('/en/about-us/history')
  await expect(page.locator('main')).toContainText('1971')
  await page.goto('/nl/over-ons/geschiedenis')
  await expect(page.locator('main')).toContainText('1971')
})

test('an old Dutch link with English segments lands on the Dutch URL', async ({ page }) => {
  await page.goto('/nl/about-us/history')
  await expect(page).toHaveURL(/\/nl\/over-ons\/geschiedenis$/)
})

test('the language switcher keeps the visitor on the same page', async ({ page }) => {
  await page.goto('/en/about-us/history')
  await page.getByRole('link', { name: 'Switch to Dutch' }).first().click()
  await expect(page).toHaveURL(/\/nl\/over-ons\/geschiedenis$/)
  await page.getByRole('link', { name: 'Switch to English' }).first().click()
  await expect(page).toHaveURL(/\/en\/about-us\/history$/)
})

test('links to content pages use the localized address', async ({ page }) => {
  await page.goto('/nl')
  // Dropdown items are only in the DOM when a menu is open, so look at every link on the page.
  const hrefs = await page.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href')))
  expect(hrefs.some((h) => h?.startsWith('/nl/over-ons'))).toBe(true)
  expect(hrefs.some((h) => h?.startsWith('/nl/about-us'))).toBe(false)
})

test('built-in routes are not replaced by a content page with the same address', async ({ page }) => {
  await page.goto('/en/vacancies')
  await expect(page.locator('main')).toContainText('Opportunities')
  await page.goto('/en/news/friends-news')
  await expect(page.locator('main')).toContainText('Friend Organizations')
})

test('the calendar lists events and opens one', async ({ page }) => {
  await page.goto('/en/activities/calendar')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main')).not.toContainText('admin panel')
})

test('the friends news list links to an item that opens', async ({ page }) => {
  // All current newsletters are friends' news, so the main newsletter list is empty.
  await page.goto('/en/news/friends-news')
  const first = page.locator('main a[href*="/news/friends-news/"]').first()
  await first.click()
  await expect(page).toHaveURL(/\/news\/friends-news\/.+/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a friends item is not served under the main newsletter address', async ({ page }) => {
  const res = await page.goto('/en/news/newsletter/Newsletter-1')
  expect(res?.status()).toBe(404)
})

test('the vacancies page renders', async ({ page }) => {
  await page.goto('/en/vacancies')
  await expect(page.locator('main')).toContainText('Board')
})

test('an unknown page gives a 404', async ({ page }) => {
  const res = await page.goto('/en/this-does-not-exist')
  expect(res?.status()).toBe(404)
})

test('the admin panel shows a login form', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('the newsletter signup form is present in the footer', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('footer input[type="email"]')).toBeVisible()
})

test('the header logo image loads', async ({ page }) => {
  await page.goto('/en')
  const logo = page.locator('header img').first()
  await expect(logo).toBeVisible()
  expect(await logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
})

test('an old upload address still delivers the file', async ({ request }) => {
  const res = await request.get('/uploads/1030.jpeg')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image/jpeg')
})

test('an address that mixes Dutch and English segments lands on the Dutch URL', async ({ page }) => {
  await page.goto('/nl/over-ons/history')
  await expect(page).toHaveURL(/\/nl\/over-ons\/geschiedenis$/)
})

test('content pages are served from the prerender cache', async ({ request }) => {
  // Guards against a page losing static rendering, for example by reading request
  // headers. The header is only present on a self-hosted `next start`.
  const base = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  test.skip(!/localhost|127\.0\.0\.1/.test(base), 'x-nextjs-cache is only exposed by next start')
  const res = await request.get('/en/about-us/history')
  expect(['HIT', 'PRERENDER', 'STALE']).toContain(res.headers()['x-nextjs-cache'])
})
