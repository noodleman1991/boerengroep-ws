import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeLocation } from './location.mjs'

test('passes a single location through', () => {
  assert.deepEqual(normalizeLocation('/nl/over-ons'), { location: '/nl/over-ons', duplicated: false })
})

test('collapses an identical duplicate, as browsers do', () => {
  assert.deepEqual(normalizeLocation('/nl/over-ons, /nl/over-ons'), { location: '/nl/over-ons', duplicated: true })
})

test('leaves two different locations alone so the chain fails visibly', () => {
  assert.deepEqual(normalizeLocation('/a, /b'), { location: '/a, /b', duplicated: false })
})

test('does not split an address that legitimately contains a comma', () => {
  assert.deepEqual(normalizeLocation('/search?q=soup, bread'), { location: '/search?q=soup, bread', duplicated: false })
})

test('returns no location for a missing header', () => {
  assert.deepEqual(normalizeLocation(null), { location: undefined, duplicated: false })
})
