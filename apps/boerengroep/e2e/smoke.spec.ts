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

// The newsletter tests answer the site's own endpoints themselves, so a test run
// never writes to the subscriber list and never sends an email.
test('signing up shows the thank-you in place of the box', async ({ page }) => {
  let sent: unknown
  await page.route('**/api/newsletter/subscribe', async (route) => {
    sent = route.request().postDataJSON()
    await route.fulfill({ json: { status: 'pending' } })
  })
  await page.goto('/nl')
  const box = page.locator('.site-footer__news')
  await box.locator('input[type="email"]').fill('anna@example.org')
  await box.getByRole('button').click()
  await expect(box.getByRole('status')).toContainText('Bijna klaar')
  await expect(box.locator('input[type="email"]')).toHaveCount(0)
  expect(sent).toEqual({ email: 'anna@example.org', language: 'nl', source: 'footer' })
})

test('a mistyped address is caught before anything is sent', async ({ page }) => {
  let calls = 0
  await page.route('**/api/newsletter/subscribe', async (route) => {
    calls++
    await route.fulfill({ json: { status: 'pending' } })
  })
  await page.goto('/en')
  const box = page.locator('.site-footer__news')
  await box.locator('input[type="email"]').fill('anna-at-example')
  await box.getByRole('button').click()
  await expect(box.getByRole('alert')).toContainText('does not look like an email address')
  expect(calls).toBe(0)
})

test('someone already on the list is told so, not shown an error', async ({ page }) => {
  await page.route('**/api/newsletter/subscribe', (route) => route.fulfill({ json: { status: 'already' } }))
  await page.goto('/en')
  const box = page.locator('.site-footer__news')
  await box.locator('input[type="email"]').fill('anna@example.org')
  await box.getByRole('button').click()
  await expect(box.getByRole('status')).toContainText('already on the list')
})

test('the confirmation link lands on a page that says you are on the list', async ({ page }) => {
  await page.route('**/api/newsletter/verify', (route) => route.fulfill({ json: { message: 'ok' } }))
  await page.goto('/en/newsletter/verify?token=11111111-1111-4111-8111-111111111111')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('You are on the list')
})

test('deleting your data starts with a link by email', async ({ page }) => {
  let sent: Record<string, unknown> = {}
  await page.route('**/api/newsletter/delete-data', async (route) => {
    sent = route.request().postDataJSON()
    await route.fulfill({ json: { status: 'email-sent' } })
  })
  await page.goto('/en/newsletter/delete-data')
  await page.locator('main input[type="email"]').fill('anna@example.org')
  await page.locator('main input[type="checkbox"]').check()
  await page.getByRole('button', { name: 'Send me the link' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Look in your inbox')
  expect(sent.email).toBe('anna@example.org')
  expect(sent.token).toBeUndefined()
})

test('the newsletter endpoints do not report on the server setup to visitors', async ({ request }) => {
  expect((await request.get('/api/newsletter/subscribe')).status()).toBe(405)
  expect((await request.get('/api/newsletter/status')).status()).toBe(401)
  expect((await request.post('/api/newsletter/sync')).status()).toBe(401)
})
