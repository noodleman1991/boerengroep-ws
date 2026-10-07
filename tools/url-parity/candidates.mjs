import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseRoutingKeys } from './routing-keys.mjs'

const app = process.argv[2] ?? 'apps/boerengroep'
const urls = new Set()

// Every routing key is tried under both locales. The collector keeps the ones that work today.
for (const key of parseRoutingKeys(readFileSync(path.join(app, 'i18n/routing.ts'), 'utf8'))) {
  for (const locale of ['en', 'nl']) urls.add(`/${locale}${key === '/' ? '' : key}`)
}

const names = (dir) => {
  try {
    return readdirSync(path.join(app, dir)).filter((f) => /\.mdx?$/.test(f) && !f.startsWith('.'))
  } catch {
    return []
  }
}
const slug = (f) => encodeURIComponent(f.replace(/\.mdx?$/, ''))

for (const locale of ['en', 'nl']) {
  for (const f of names(`content/newsletters/${locale}`)) {
    urls.add(`/${locale}/news/newsletter/${slug(f)}`)
    urls.add(`/${locale}/news/friends-news/${slug(f)}`)
  }
  for (const f of names('content/past-events')) urls.add(`/${locale}/activities/past-events/${slug(f)}`)
}

const walk = (dir, base) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, `${base}/${entry.name}`)
    else urls.add(encodeURI(`${base}/${entry.name}`))
  }
}
walk(path.join(app, 'public/uploads'), '/uploads')

console.log([...urls].sort().join('\n'))
