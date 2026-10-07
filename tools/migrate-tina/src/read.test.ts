import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { listContent, readTinaFile } from './read'

let dir: string

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'tina-'))
  mkdirSync(path.join(dir, 'events/en/past events'), { recursive: true })
  mkdirSync(path.join(dir, 'global'), { recursive: true })
  writeFileSync(path.join(dir, 'events/en/b.mdx'), '---\ntitle: B\nfeatured: true\n---\n\nBody **text**\n')
  writeFileSync(path.join(dir, 'events/en/a.md'), '---\ntitle: A\n---\n')
  writeFileSync(path.join(dir, 'events/en/past events/.gitkeep.mdx'), '')
  writeFileSync(path.join(dir, 'events/.DS_Store'), 'junk')
  writeFileSync(path.join(dir, 'global/index.json'), '{"theme":{"font":"lato"}}')
})

describe('listContent', () => {
  it('lists content files recursively, sorted, without dotfiles', () => {
    expect(listContent(dir, 'events')).toEqual(['events/en/a.md', 'events/en/b.mdx'])
  })
  it('returns an empty list for a folder that does not exist', () => {
    expect(listContent(dir, 'vacancies')).toEqual([])
  })
})

describe('readTinaFile', () => {
  it('splits front matter from the body', () => {
    const file = readTinaFile(dir, 'events/en/b.mdx')
    expect(file.legacyId).toBe('events/en/b.mdx')
    expect(file.data).toEqual({ title: 'B', featured: true })
    expect(file.body.trim()).toBe('Body **text**')
  })
  it('reads a JSON file as data with an empty body', () => {
    const file = readTinaFile(dir, 'global/index.json')
    expect(file.data.theme.font).toBe('lato')
    expect(file.body).toBe('')
  })
})
