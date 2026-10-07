import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { findDestructive } from './find-destructive.mjs'

const base = process.env.BASE_REF ?? 'origin/main'
const files = execSync(
  `git diff --name-only --diff-filter=AM ${base}...HEAD -- packages/cms/src/migrations`,
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((f) => f.endsWith('.ts') && !f.endsWith('index.ts'))

let failed = false
for (const file of files) {
  const found = findDestructive(readFileSync(file, 'utf8'))
  if (found.length) {
    failed = true
    console.error(`${file}: ${found.join(', ')}`)
  }
}

if (failed) {
  console.error(
    '\nBoth sites read this database. Remove columns only in a release after both apps stopped reading them,',
  )
  console.error('then add a comment to the migration: // contract-ok: <why this is safe>')
  process.exit(1)
}
console.log(`Checked ${files.length} migration file(s): no unmarked destructive changes.`)
