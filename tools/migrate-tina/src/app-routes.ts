import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Static addresses that the app serves from its own route folders under `app/[locale]`.
 * Dynamic segments are left out. Route groups such as `(marketing)` do not appear in the address.
 */
export function listAppRoutes(appDir: string): string[] {
  const root = path.join(appDir, 'app', '[locale]')
  if (!existsSync(root)) return []
  const routes: string[] = []
  const walk = (dir: string, segments: string[]) => {
    const entries = readdirSync(dir, { withFileTypes: true })
    if (entries.some((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name))) {
      routes.push(`/${segments.join('/')}`)
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('[') || entry.name.startsWith('_')) continue
      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
      walk(path.join(dir, entry.name), isGroup ? segments : [...segments, entry.name])
    }
  }
  walk(root, [])
  return routes.sort()
}
