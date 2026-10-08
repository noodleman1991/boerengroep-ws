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
  await page.getByRole('link', { name: 'Schakel naar Nederlands' }).first().click()
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

test('the month view is a table of days that can be leafed through', async ({ page }) => {
  await page.goto('/nl/activities/calendar?view=month')
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('columnheader')).toHaveCount(7)
  await page.getByRole('button', { name: 'Vorige maand' }).click()
  await page.getByRole('button', { name: 'Deze maand' }).click()
  await expect(page.getByRole('button', { name: 'Deze maand' })).toHaveCount(0)
})

test('choosing a day in the month shows what is on that day', async ({ page }) => {
  await page.goto('/en/activities/calendar?view=month')
  const day = page.locator('button.month__tile').first()
  test.skip((await day.count()) === 0, 'this month and the days around it have no events in this content')
  await day.click()
  await expect(day).toHaveAttribute('aria-pressed', 'true')
  // "Wednesday 30 September, 2 events": the panel carries the day as its heading.
  const label = (await day.getAttribute('aria-label'))!
  await expect(page.locator('.month__day-title')).toHaveText(label.split(',')[0]!)
  await expect(page.locator('.month__day .event-row').first()).toBeVisible()
})

test('the calendar filter offers the kinds editors made and narrows the list to one', async ({ page }) => {
  await page.goto('/en/activities/calendar?view=past')
  const chips = page.locator('.calendar .chips .chip')
  test.skip((await chips.count()) < 3, 'the past events in this content are of fewer than two kinds')
  await expect(chips.first()).toHaveAttribute('aria-pressed', 'true')
  const kind = chips.nth(1)
  const count = Number(await kind.locator('.chip__count').textContent())
  const name = (await kind.textContent())!.replace(/\d+$/, '').trim()
  await kind.click()
  await expect(kind).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.event-row')).toHaveCount(count)
  expect(new Set(await page.locator('.event-row .event-kind').allTextContents())).toEqual(new Set([name]))
  // Pressing it again shows everything.
  await kind.click()
  await expect(chips.first()).toHaveAttribute('aria-pressed', 'true')
})

test('kinds of events carry the name of the reader’s language', async ({ page }) => {
  // "Excursion" is one of the kinds made from the old site's list. Skipped when an editor renamed it.
  await page.goto('/en/activities/calendar?view=past')
  const english = page.locator('.calendar .chip', { hasText: 'Excursion' })
  test.skip((await english.count()) === 0, 'this content has no kind called Excursion')
  await page.goto('/nl/activities/calendar?view=past')
  await expect(page.locator('.calendar .chip', { hasText: 'Excursie' })).toHaveCount(1)
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

test('a vacancy says whether people can apply, opens, and is the same post in Dutch', async ({ page }) => {
  await page.goto('/en/vacancies')
  const vacancies = page.locator('details.vacancy')
  const count = await vacancies.count()
  test.skip(count === 0, 'this content has no vacancies')
  const first = vacancies.first()
  await expect(first.locator('.vacancy__state')).toHaveText(/^(Open|Apply until .+|Closed)$/)
  await expect(first.locator('.vacancy__body')).toBeHidden()
  await first.locator('summary').click()
  await expect(first.locator('.vacancy__body')).toBeVisible()
  // A link to one vacancy opens it.
  const id = await vacancies.nth(count - 1).getAttribute('id')
  await page.goto(`/en/vacancies#${id}`)
  await expect(page.locator(`details.vacancy[id="${id}"]`)).toHaveJSProperty('open', true)
  // One post per vacancy: the Dutch page lists the same ones, in Dutch wording.
  await page.goto('/nl/vacancies')
  await expect(page.locator('details.vacancy')).toHaveCount(count)
  await expect(page.locator('.vacancy__state').first()).toHaveText(/^(Open|Reageren tot en met .+|Gesloten)$/)
})

test('a page without a picture opens with the symbol of the logo', async ({ page }) => {
  await page.goto('/en')
  const symbol = page.locator('.hero__symbol')
  test.skip((await symbol.count()) === 0, 'the home page has a picture in this content')
  await expect(symbol).toBeVisible()
  expect(await symbol.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true)
})

test('the photo page shows its pictures as a gallery with their captions', async ({ page }) => {
  const res = await page.goto('/en/library/media')
  test.skip(res?.status() !== 200, 'this content has no photo page')
  expect(await page.locator('.mosaic__tile').count()).toBeGreaterThan(1)
  await expect(page.locator('.mosaic__caption').first()).toBeVisible()
  await page.locator('.mosaic__tile button').first().click()
  await expect(page.getByRole('dialog').locator('.lightbox__caption')).not.toBeEmpty()
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

// The block tests use the test page (pnpm --filter @sites/cms seed:test-page).
// Where that page does not exist, for example on a fresh database, they are skipped.
const examples = '/en/test-blocks'
async function openExamples(page: import('@playwright/test').Page) {
  const res = await page.goto(examples)
  test.skip(res?.status() !== 200, 'the test page for blocks is not seeded here')
}

test('a photo opens large and the arrow keys move through the gallery', async ({ page }) => {
  await openExamples(page)
  await page.getByRole('button', { name: /^Open photo \d+ of/ }).first().click()
  const large = page.getByRole('dialog')
  await expect(large).toBeVisible()
  const count = large.locator('.lightbox__count')
  const first = Number((await count.textContent())!.split(' ')[0])
  await page.keyboard.press('ArrowRight')
  await expect(count).toHaveText(new RegExp(`^${first + 1} of`))
  await page.keyboard.press('ArrowLeft')
  await expect(count).toHaveText(new RegExp(`^${first} of`))
  // The strip of small pictures jumps straight to one.
  await large.locator('.lightbox__thumb').last().click()
  await expect(large.locator('.lightbox__thumb').last()).toHaveAttribute('aria-current', 'true')
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
  await form.getByRole('button', { name: 'Send the test' }).click()
  await expect(form.getByText('Fill this in.').first()).toBeVisible()
  await form.getByLabel('Your name').fill('Test visitor')
  await form.getByLabel('Email').fill('test@example.org')
  await form.getByLabel('Size').selectOption('m')
  await form.getByLabel(/I understand this is a test/).check()
  await form.getByRole('button', { name: 'Send the test' }).click()
  await expect(page.locator('.form-block').getByRole('status')).toContainText('Thank you')
})

test('an item says it is a donation, shows its pictures and opens its form', async ({ page }) => {
  await openExamples(page)
  const item = page.locator('.item')
  await expect(item).toContainText('Suggested donation')
  await expect(item.locator('.item__note')).toContainText('This is a donation to')
  await expect(item.locator('.item__note')).toContainText('not a purchase')
  await item.getByRole('button', { name: 'Show picture 2' }).click()
  await expect(item.getByRole('button', { name: 'Show picture 2' })).toHaveAttribute('aria-current', 'true')
  await expect(item.locator('form')).toHaveCount(0)
  await item.getByRole('button', { name: 'Ask for one' }).click()
  await expect(item.locator('form')).toBeVisible()
})

test('a video among the photos plays in the large view only when asked', async ({ page }) => {
  const asked: string[] = []
  await page.route((url) => /youtube|ytimg|vimeo/.test(url.hostname), async (route) => {
    asked.push(new URL(route.request().url()).hostname)
    await route.abort()
  })
  await openExamples(page)
  const tile = page.getByRole('button', { name: /^Play video \d+ of/ }).first()
  await tile.scrollIntoViewIfNeeded()
  expect(asked).toEqual([])
  // Reaching the video with the arrow keys does not load it.
  await page.getByRole('button', { name: /^Open photo \d+ of/ }).first().click()
  const large = page.getByRole('dialog')
  await large.locator('.lightbox__thumb').first().click()
  await expect(large.getByRole('button', { name: /Play video/ }).first()).toBeVisible()
  expect(asked).toEqual([])
  await page.keyboard.press('Escape')
  // Pressing play on the tile does.
  await tile.click()
  await expect(page.getByRole('dialog').locator('iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\//)
})

test('a picture in a text has the size and the place the editor chose', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await openExamples(page)
  const small = page.locator('.rich-figure--small.rich-figure--left').first()
  const medium = page.locator('.rich-figure--medium.rich-figure--right').first()
  const large = page.locator('.rich-figure--large').first()
  await expect(small).toBeVisible()
  const width = async (figure: typeof small) => (await figure.boundingBox())!.width
  expect(await width(small)).toBeLessThan(await width(medium))
  expect(await width(medium)).toBeLessThan(await width(large))
  // On a wide screen the text runs beside a small picture.
  expect(await small.evaluate((figure) => getComputedStyle(figure).float)).toBe('left')
  expect(await medium.evaluate((figure) => getComputedStyle(figure).float)).toBe('right')
  expect(await large.evaluate((figure) => getComputedStyle(figure).float)).toBe('none')
  await expect(small.locator('figcaption')).toHaveText('A small picture, on the left')
  // On a phone every picture gets its own line.
  await page.setViewportSize({ width: 390, height: 800 })
  expect(await small.evaluate((figure) => getComputedStyle(figure).float)).toBe('none')
})

test('a photo gallery inside a text opens its photos large', async ({ page }) => {
  await openExamples(page)
  const gallery = page.locator('.rich-gallery')
  await expect(gallery.locator('.mosaic--small .mosaic__tile')).toHaveCount(6)
  await expect(gallery.locator('figcaption')).toHaveText('Photo gallery in a text, small pictures')
  await gallery.getByRole('button', { name: /^Open photo 2 of 6/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').locator('.lightbox__count')).toHaveText(/^2 of 6/)
  await page.keyboard.press('Escape')
})

test('a gallery in even rows gives every photo the same size', async ({ page }) => {
  await openExamples(page)
  const tiles = page.locator('.mosaic--even.mosaic--medium .mosaic__tile')
  await expect(tiles).toHaveCount(5)
  const sizes = await tiles.evaluateAll((list) => list.map((tile) => Math.round(tile.getBoundingClientRect().width)))
  expect(new Set(sizes).size).toBe(1)
})

test('the spotlight shows what the editor chose, with their own words, and leads there', async ({ page }) => {
  await openExamples(page)
  const large = page.locator('.spot--large')
  test.skip((await large.count()) === 0, 'this content has nothing to put in the spotlight')
  await expect(large.getByRole('heading', { name: 'Spotlight block: one thing, shown large' })).toBeVisible()
  await expect(large).toContainText('Own text for the spotlight.')
  const link = large.getByRole('link')
  const href = await link.getAttribute('href')
  expect(href).toMatch(/^\/en\//)
  // Several things stand side by side, each with a button that names where it leads.
  const several = page.locator('.spots--2 .spot, .spots--3 .spot')
  expect(await several.count()).toBeGreaterThanOrEqual(2)
  const names = await several.getByRole('link').evaluateAll((links) => links.map((a) => a.textContent))
  expect(new Set(names).size).toBe(names.length)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
  await expect(page.locator('main h1, main h2').first()).toBeVisible()
})

test('the news block lists the newest items by itself and leads to all news', async ({ page }) => {
  await openExamples(page)
  const block = page.locator('section', { has: page.getByRole('heading', { name: 'Latest news block' }) })
  test.skip((await block.count()) === 0, 'this content has no news')
  const rows = block.locator('.brief')
  expect(await rows.count()).toBeGreaterThanOrEqual(1)
  expect(await rows.count()).toBeLessThanOrEqual(4)
  // Newest first.
  const days = await block.locator('.brief time').evaluateAll((list) => list.map((time) => time.getAttribute('datetime')!))
  expect([...days].sort().reverse()).toEqual(days)
  await block.getByRole('link', { name: 'All news' }).click()
  await expect(page).toHaveURL(/\/en\/news$/)
})

test('the open positions block lists what people can apply for, and a position opens on the positions page', async ({ page }) => {
  await openExamples(page)
  const block = page.locator('section', { has: page.getByRole('heading', { name: 'Open positions block' }) })
  await expect(block).toBeVisible()
  const rows = block.locator('.brief')
  test.skip((await rows.count()) === 0, 'nothing is open in this content right now')
  // Every row says until when, or that it is always open.
  for (const meta of await rows.locator('.brief__meta').allTextContents()) expect(meta).toMatch(/Apply until|Always open/)
  const first = rows.first().getByRole('link')
  const title = (await first.textContent())!.trim()
  await first.click()
  await expect(page).toHaveURL(/\/en\/vacancies#vacancy-/)
  const opened = page.locator('details.vacancy[open]', { hasText: title })
  await expect(opened).toHaveCount(1)
})

test('the home page shows the latest news and the open positions', async ({ page }) => {
  await page.goto('/en')
  const news = page.locator('section', { has: page.getByRole('heading', { name: 'News', exact: true }) })
  test.skip((await news.count()) === 0, 'the home page of this site has no news block')
  expect(await news.locator('.brief').count()).toBeGreaterThanOrEqual(1)
  await expect(page.getByRole('heading', { name: 'Join us', exact: true })).toBeVisible()
  await page.goto('/nl')
  await expect(page.getByRole('heading', { name: 'Nieuws', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Doe mee', exact: true })).toBeVisible()
})

test('the year plan and the year report come from this site, not from the old file server', async ({ page, request }) => {
  const res = await page.goto('/en/about-us/what-is-boerengroep')
  test.skip(res?.status() !== 200, 'this site has no such page')
  expect(await page.locator('a[href*="tina.io"]').count()).toBe(0)
  for (const name of [/Year Plan/, /Year Report/]) {
    const href = await page.getByRole('link', { name }).first().getAttribute('href')
    expect(href, String(name)).toBeTruthy()
    const file = await request.get(href!)
    expect(file.status(), href!).toBe(200)
    expect(file.headers()['content-type']).toContain('application/pdf')
  }
  await page.goto('/nl/over-ons/wat-is-boerengroep')
  expect(await page.locator('a[href*="tina.io"]').count()).toBe(0)
  await expect(page.getByRole('link', { name: /Jaarplan/ })).toHaveCount(1)
})

test('form answers cannot be sent for a form of another site or with made-up fields', async ({ request }) => {
  const missing = await request.post('/api/form-submit', { data: { form: 999999, values: { name: 'x' }, elapsedMs: 5000 } })
  expect(missing.status()).toBe(404)
  const invalid = await request.post('/api/form-submit', { data: { form: 1 } })
  expect(invalid.status()).toBe(400)
})

test('after logging in, the admin greets with shortcuts and a menu grouped by task', async ({ page }) => {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  test.skip(!email || !password, 'no admin account is given to this test run')
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(email!)
  await page.locator('input[name="password"]').fill(password!)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/admin\/?$/)
  const welcome = page.locator('.dashboard-intro')
  await expect(welcome.getByRole('link', { name: /Add an event/ })).toHaveAttribute('href', '/admin/collections/events/create')
  await expect(welcome.getByRole('link', { name: /Menu, footer and newsletter/ })).toBeVisible()
  // The groups, in the order editors work: pages, calendar, news, library, forms, settings, people.
  const headings = (await page.getByRole('heading', { level: 2 }).allTextContents()).map((text) => text.trim())
  expect(headings.filter((text) => !text.startsWith('Hello'))).toEqual(['Pages', 'Calendar', 'News and vacancies', 'Library', 'Forms', 'Site settings', 'People and sites'])
})
