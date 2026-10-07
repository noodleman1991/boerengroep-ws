import assert from 'node:assert/strict'
import { test } from 'node:test'
import { outcome } from './outcome.mjs'

test('a direct 200 is ok', () => {
  assert.equal(outcome([{ status: 200 }]), 'ok')
})

test('a redirect that ends in 200 is acceptable', () => {
  assert.equal(outcome([{ status: 308, location: '/nl/over-ons' }, { status: 200 }]), 'redirect-ok')
})

test('a 404 is broken', () => {
  assert.equal(outcome([{ status: 404 }]), 'broken')
})

test('a redirect that ends in 404 is broken', () => {
  assert.equal(outcome([{ status: 301, location: '/x' }, { status: 404 }]), 'broken')
})

test('a 500 is broken', () => {
  assert.equal(outcome([{ status: 500 }]), 'broken')
})

test('a chain that never settles is a loop', () => {
  const hop = { status: 308, location: '/a' }
  assert.equal(outcome([hop, hop, hop, hop, hop, hop]), 'loop')
})

test('an empty chain is broken', () => {
  assert.equal(outcome([]), 'broken')
})
