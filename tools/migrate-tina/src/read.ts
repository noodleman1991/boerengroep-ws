import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export type TinaFile = { legacyId: string; data: Record<string, any>; body: string }

const CONTENT_EXT = /\.(mdx?|json)$/

export function listContent(contentDir: string, sub: string): string[] {
  const root = path.join(contentDir, sub)
  if (!existsSync(root)) return []
  const out: string[] = []
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const child = path.join(abs, entry.name)
      if (entry.isDirectory()) walk(child)
      else if (CONTENT_EXT.test(entry.name)) out.push(path.relative(contentDir, child).split(path.sep).join('/'))
    }
  }
  walk(root)
  return out.sort()
}

export function readTinaFile(contentDir: string, relPath: string): TinaFile {
  const raw = readFileSync(path.join(contentDir, relPath), 'utf8')
  if (relPath.endsWith('.json')) return { legacyId: relPath, data: JSON.parse(raw), body: '' }
  const parsed = matter(raw)
  return { legacyId: relPath, data: parsed.data, body: parsed.content }
}
