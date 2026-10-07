import { readFileSync } from 'node:fs'
import { outcome } from './outcome.mjs'
import { probe } from './probe.mjs'

const [base, input] = process.argv.slice(2)
if (!base || !input) {
  console.error('usage: check.mjs <newBaseUrl> <urlsFile>')
  process.exit(2)
}

const urls = readFileSync(input, 'utf8').split('\n').filter(Boolean)
const failures = []
let redirected = 0
let duplicated = 0
for (const path of urls) {
  const chain = await probe(base, path)
  const result = outcome(chain)
  if (chain.some((hop) => hop.duplicatedLocation)) duplicated++
  if (result === 'redirect-ok') redirected++
  if (result === 'broken' || result === 'loop') {
    failures.push(`${result.padEnd(6)} ${path}  [${chain.map((c) => c.status).join(' -> ')}]`)
  }
}

console.log(`${urls.length} URLs checked on ${base}: ${redirected} redirected, ${failures.length} failed`)
if (duplicated) {
  console.log(
    `${duplicated} redirects carried the Location header twice (first, uncached response). Browsers accept this; some HTTP clients do not.`,
  )
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
