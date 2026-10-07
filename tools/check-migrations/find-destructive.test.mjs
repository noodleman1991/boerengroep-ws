import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findDestructive } from './find-destructive.mjs'

const wrap = (up, down = '') => `
export async function up({ db }) { await db.execute(sql\`${up}\`) }
export async function down({ db }) { await db.execute(sql\`${down}\`) }
`

test('accepts an additive migration', () => {
  assert.deepEqual(findDestructive(wrap('ALTER TABLE "pages" ADD COLUMN "x" varchar;')), [])
})

test('flags a dropped column', () => {
  assert.deepEqual(findDestructive(wrap('ALTER TABLE "pages" DROP COLUMN "x";')), ['DROP COLUMN'])
})

test('flags a dropped table and a rename together', () => {
  const found = findDestructive(wrap('DROP TABLE "old"; ALTER TABLE "a" RENAME COLUMN "x" TO "y";'))
  assert.deepEqual(found.sort(), ['DROP TABLE', 'RENAME COLUMN'])
})

test('ignores destructive statements in the down function', () => {
  assert.deepEqual(findDestructive(wrap('SELECT 1;', 'DROP TABLE "pages";')), [])
})

test('accepts a destructive migration that is marked as a contract step', () => {
  const src = `// contract-ok: both apps stopped reading pages.x in release 2026-11-01\n${wrap('ALTER TABLE "pages" DROP COLUMN "x";')}`
  assert.deepEqual(findDestructive(src), [])
})

test('does not accept an empty contract marker', () => {
  const src = `// contract-ok:\n${wrap('ALTER TABLE "pages" DROP COLUMN "x";')}`
  assert.deepEqual(findDestructive(src), ['DROP COLUMN'])
})
