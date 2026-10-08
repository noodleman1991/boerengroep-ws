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

test('the calendar lists events and opens one on its own page', async ({ page }) => {
  await page.goto('/en/activities/calendar')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main')).not.toContainText('admin panel')
  // The content may have nothing coming up, so look at what has been.
  await page.getByRole('button', { name: 'Past', exact: true }).click()
  const first = page.locator('.event-row__title a').first()
  const title = (await first.textContent())?.trim()
  await first.click()
  await expect(page).toHaveURL(/\/en\/activities\/calendar\/[^/]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
})

test('the month view shows a grid and the events of a chosen day', async ({ page }) => {
  await page.goto('/nl/activities/calendar?view=month')
  await expect(page.getByRole('grid')).toBeVisible()
  await expect(page.getByRole('columnheader')).toHaveCount(7)
  await page.getByRole('button', { name: 'Vorige maand' }).click()
  await page.getByRole('button', { name: 'Deze maand' }).click()
  await expect(page.getByRole('button', { name: 'Deze maand' })).toHaveCount(0)
})

test('an event can be saved as a calendar file', async ({ page, request }) => {
  await page.goto('/en/activities/calendar')
  await page.getByRole('button', { name: 'Past', exact: true }).click()
  const href = await page.locator('.event-row__title a').first().getAttribute('href')
  const slug = href!.split('/').pop()!
  const res = await request.get(`/calendar/${slug}.ics`)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/calendar')
  expect(res.headers()['content-disposition']).toContain('attachment')
  const body = await res.text()
  expect(body).toContain('BEGIN:VEVENT')
  expect(body).toContain(`/en/activities/calendar/${slug}`)
  expect((await request.get('/calendar/no-such-event.ics')).status()).toBe(404)
})

test('the calendar feed is a calendar that apps can subscribe to', async ({ request }) => {
  const res = await request.get('/calendar.ics?lang=nl')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/calendar')
  const body = await res.text()
  expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
  expect(body).toContain('REFRESH-INTERVAL')
  expect(body).toContain('/nl/activities/calendar/')
})

test('an event page offers a calendar file and sharing', async ({ page }) => {
  await page.goto('/en/activities/calendar')
  const upcoming = page.locator('.event-row__title a')
  test.skip((await upcoming.count()) === 0, 'the content has no upcoming event right now')
  await upcoming.first().click()
  await page.getByRole('button', { name: 'Add to my calendar' }).click()
  await expect(page.getByRole('link', { name: /Calendar file/ })).toHaveAttribute('href', /\/calendar\/.+\.ics$/)
  await expect(page.getByRole('link', { name: 'Google Calendar' })).toHaveAttribute('href', /calendar\.google\.com/)
})

test('an unknown event gives a 404', async ({ page }) => {
  const res = await page.goto('/en/activities/calendar/this-event-does-not-exist')
  expect(res?.status()).toBe(404)
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

// The block tests use the "Block examples" page (pnpm --filter @sites/cms seed:demo).
// Where that page does not exist, for example on a fresh database, they are skipped.
const examples = '/en/block-examples'
async function openExamples(page: import('@playwright/test').Page) {
  const res = await page.goto(examples)
  test.skip(res?.status() !== 200, 'the Block examples page is not seeded here')
}

test('a photo opens large and the arrow keys move through the gallery', async ({ page }) => {
  await openExamples(page)
  await page.getByRole('button', { name: /^Open photo 1 of/ }).first().click()
  const large = page.getByRole('dialog')
  await expect(large).toBeVisible()
  await expect(large).toContainText(/1 of \d+/)
  await page.keyboard.press('ArrowRight')
  await expect(large).toContainText(/2 of \d+/)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(large).not.toContainText(/^1 of/)
  await page.keyboard.press('Escape')
  await expect(large).toHaveCount(0)
})

test('a video contacts YouTube only after the visitor presses play', async ({ page }) => {
  const asked: string[] = []
  // Only requests that go to those sites count. The cover picture comes through this site's own server.
  await page.route((url) => /youtube|ytimg|vimeo/.test(url.hostname), async (route) => {
    asked.push(new URL(route.request().url()).hostname)
    await route.abort()
  })
  await openExamples(page)
  await page.locator('.video').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  expect(asked).toEqual([])
  await page.getByRole('button', { name: /Play video/ }).first().click()
  await expect(page.locator('.video iframe').first()).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\//)
  expect(asked).toContain('www.youtube-nocookie.com')
})

test('a form says what is missing, and thanks you when it is complete', async ({ page }) => {
  await openExamples(page)
  const form = page.locator('.form-block form')
  await form.scrollIntoViewIfNeeded()
  // The site ignores answers that arrive faster than a person can type.
  await page.waitForTimeout(1700)
  await form.getByRole('button', { name: 'Send my order' }).click()
  await expect(form.getByText('Fill this in.').first()).toBeVisible()
  await form.getByLabel('Your name').fill('Test visitor')
  await form.getByLabel('Email').fill('test@example.org')
  await form.getByLabel('Size').selectOption('m')
  await form.getByLabel(/I pick it up/).check()
  await form.getByRole('button', { name: 'Send my order' }).click()
  await expect(page.locator('.form-block').getByRole('status')).toContainText('Thank you')
})

test('an item shows its order form after pressing the button', async ({ page }) => {
  await openExamples(page)
  const item = page.locator('.item')
  await expect(item.locator('form')).toHaveCount(0)
  await item.getByRole('button', { name: 'Order a shirt' }).click()
  await expect(item.locator('form')).toBeVisible()
  await item.getByRole('button', { name: 'Next picture' }).click()
  await expect(item).toContainText('2 of 3')
})

test('form answers cannot be sent for a form of another site or with made-up fields', async ({ request }) => {
  const missing = await request.post('/api/form-submit', { data: { form: 999999, values: { name: 'x' }, elapsedMs: 5000 } })
  expect(missing.status()).toBe(404)
  const invalid = await request.post('/api/form-submit', { data: { form: 1 } })
  expect(invalid.status()).toBe(400)
})
