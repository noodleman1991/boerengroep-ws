// Both sites run the same pages. The pages live in apps/boerengroep. A second app needs a file
// for every address of its own, so this script writes those files: each is a few lines that
// hand over to the shared page. Run it after adding, removing or renaming a route:
//
//   node tools/site-routes/sync.mjs          writes the files
//   node tools/site-routes/sync.mjs --check  only says what would change (used by a test)
//
// A file in the second app without the "Written by" line at the top is hand-made and left alone.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const FROM = path.join(root, 'apps/boerengroep/app')
const TARGETS = ['inspringtheater']
const MARK = '// Written by tools/site-routes/sync.mjs. Do not edit: change the page in apps/boerengroep instead.'

/** Files Next.js treats as a route or as part of one. */
const ROUTE_FILE = /^(page|layout|route|not-found|error|global-error|loading|template|default|robots|sitemap|manifest|opengraph-image|icon)\.(tsx?|jsx?)$/
/** Folders that belong to one app only. The admin panel lives in the Boerengroep app. */
const OWN = new Set(['(payload)'])
/** What a route file may hand on by name. */
const NAMED = ['generateMetadata', 'generateStaticParams', 'generateViewport', 'viewport', 'metadata', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
/** Settings Next.js reads from the file itself, so they are copied as written. */
const SETTINGS = ['revalidate', 'dynamic', 'dynamicParams', 'fetchCache', 'runtime', 'preferredRegion', 'maxDuration']

function routeFiles(dir, base = '') {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const abs = path.join(dir, name)
    const rel = path.join(base, name)
    if (statSync(abs).isDirectory()) {
      if (!OWN.has(name)) out.push(...routeFiles(abs, rel))
    } else if (ROUTE_FILE.test(name)) out.push(rel)
  }
  return out
}

/** The few lines that hand a route over to the shared page. */
export function thinFile(rel, source, targetApp) {
  const from = path.join(root, 'apps', targetApp, 'app', path.dirname(rel))
  const to = path.join(FROM, rel).replace(/\.(tsx?|jsx?)$/, '')
  const spec = path.relative(from, to).split(path.sep).join('/')
  const lines = []
  if (/^\s*(['"])use client\1/.test(source)) lines.push("'use client';", '')
  lines.push(MARK)
  const names = []
  if (/^export default\b/m.test(source) || /export \{[^}]*\bdefault\b[^}]*\}/.test(source)) names.push('default')
  for (const name of NAMED) {
    if (new RegExp(`^export (?:async )?(?:function|const|let) ${name}\\b`, 'm').test(source)) names.push(name)
  }
  if (names.length > 0) lines.push(`export { ${names.join(', ')} } from '${spec}';`)
  for (const name of SETTINGS) {
    const found = source.match(new RegExp(`^export const ${name}\\s*=\\s*([^;\\n]+);?\\s*$`, 'm'))
    if (found) lines.push(`export const ${name} = ${found[1].trim()};`)
  }
  return `${lines.join('\n')}\n`
}

const check = process.argv.includes('--check')
const changes = []
for (const app of TARGETS) {
  const appDir = path.join(root, 'apps', app, 'app')
  const wanted = new Set()
  for (const rel of routeFiles(FROM)) {
    wanted.add(rel)
    const target = path.join(appDir, rel)
    const next = thinFile(rel, readFileSync(path.join(FROM, rel), 'utf8'), app)
    const now = existsSync(target) ? readFileSync(target, 'utf8') : null
    if (now !== null && !now.includes(MARK)) continue // hand-made
    if (now === next) continue
    changes.push(`${now === null ? 'add' : 'update'} apps/${app}/app/${rel}`)
    if (!check) {
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, next)
    }
  }
  // A route that left the shared app leaves the second app too.
  if (existsSync(appDir)) {
    for (const rel of routeFiles(appDir)) {
      const target = path.join(appDir, rel)
      if (wanted.has(rel) || !readFileSync(target, 'utf8').includes(MARK)) continue
      changes.push(`remove apps/${app}/app/${rel}`)
      if (!check) rmSync(target)
    }
  }
}
console.log(changes.length ? changes.join('\n') : 'Every route of the second app is in step with the shared pages.')
if (check && changes.length) process.exit(1)
