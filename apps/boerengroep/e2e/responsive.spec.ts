import { expect, test } from '@playwright/test'
import { openKind, PAGE_KINDS } from './pages'

/**
 * Every kind of page at every common screen width, from a small phone to a wide monitor.
 * A page passes when nothing makes it scroll sideways, no heading is cut off, nothing that
 * can be clicked sticks out of the screen, and on touch widths every control is big enough
 * to hit with a finger.
 */
const WIDTHS = [320, 360, 390, 430, 600, 768, 820, 1024, 1180, 1280, 1440, 1920]

for (const kind of PAGE_KINDS) {
  test(`fits every screen width: ${kind.name}`, async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 1280, height: 900 })
    test.skip(!(await openKind(page, kind)), 'this page does not exist in this database')
    const problems: string[] = []
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: width < 700 ? 800 : 900 })
      await page.waitForTimeout(150)
      const found = await page.evaluate((touch) => {
        const out: string[] = []
        const doc = document.documentElement
        if (doc.scrollWidth > doc.clientWidth + 1) out.push(`scrolls sideways by ${doc.scrollWidth - doc.clientWidth}px`)
        const name = (el: Element) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : ''} "${(el.textContent ?? '').trim().slice(0, 30)}"`
        const visible = (el: Element) => {
          const r = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
        }
        // Headings must show in full.
        for (const heading of document.querySelectorAll('main h1, main h2, main h3')) {
          if (visible(heading) && heading.scrollWidth > heading.clientWidth + 1) out.push(`heading is cut off: ${name(heading)}`)
        }
        // Nothing to click may stick out of the screen, and on a touch screen it must be big enough.
        for (const control of document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')) {
          if (!visible(control) || control.closest('[aria-hidden="true"], [inert], .site-form__trap, .sr-only')) continue
          const r = control.getBoundingClientRect()
          if (r.right > doc.clientWidth + 1 || r.left < -1) {
            // A strip that scrolls sideways on purpose may hold controls beyond the edge.
            if (!control.closest('.lightbox__strip, .item__strip, .item__thumbs')) out.push(`sticks out of the screen: ${name(control)}`)
          }
          const inText = control.tagName === 'A' && getComputedStyle(control).display.startsWith('inline') && control.closest('p, li, dd, figcaption, address, .rich')
          const input = control as HTMLInputElement
          const tiny = input.type === 'checkbox' || input.type === 'radio'
          if (touch && !inText && !tiny && (r.width < 24 || r.height < 24)) out.push(`too small to tap (${Math.round(r.width)}x${Math.round(r.height)}): ${name(control)}`)
        }
        return out
      }, width <= 820)
      for (const problem of found) problems.push(`${width}px: ${problem}`)
    }
    expect([...new Set(problems)]).toEqual([])
  })
}
