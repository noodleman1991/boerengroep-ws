import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseRoutingKeys } from './routing-keys.mjs'

const src = `
export const routing = defineRouting({
    locales: ['en', 'nl'],
    pathnames: {
        '/': "/",
        '/about-us/history': "/about-us/history",
        '/activiteiten/soepkeuken': "/activiteiten/soepkeuken",
        '/news/newsletter/[...slug]': "/news/newsletter/[...slug]",
        '/library': { en: '/library', nl: '/bibliotheek' },
    },
});`

test('returns static pathname keys', () => {
  assert.deepEqual(parseRoutingKeys(src), ['/', '/about-us/history', '/activiteiten/soepkeuken', '/library'])
})

test('leaves out dynamic routes', () => {
  assert.ok(!parseRoutingKeys(src).some((k) => k.includes('[')))
})

test('returns nothing for a file without pathnames', () => {
  assert.deepEqual(parseRoutingKeys("export const routing = defineRouting({ locales: ['en'] })"), [])
})
