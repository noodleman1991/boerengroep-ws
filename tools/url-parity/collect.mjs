import { readFileSync, writeFileSync } from 'node:fs'
import { outcome } from './outcome.mjs'
import { probe } from './probe.mjs'

const [base, input, output] = process.argv.slice(2)
if (!base || !input || !output) {
  console.error('usage: collect.mjs <oldBaseUrl> <candidatesFile> <outFile>')
  process.exit(2)
}

const candidates = readFileSync(input, 'utf8').split('\n').filter(Boolean)
const working = []
for (const path of candidates) {
  const result = outcome(await probe(base, path))
  if (result === 'ok' || result === 'redirect-ok') working.push(path)
}
writeFileSync(output, `${working.join('\n')}\n`)
console.log(`${working.length} of ${candidates.length} candidate URLs work on ${base}`)
