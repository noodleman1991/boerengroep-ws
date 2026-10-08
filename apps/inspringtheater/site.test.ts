import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const here = __dirname
const shared = path.resolve(here, '../boerengroep')
const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'))

describe('this app and the shared pages it runs', () => {
  it('has the same packages as the Boerengroep app, so both use one copy of each', () => {
    // The pages are compiled from the other app's folder. They only work when every package
    // they import is the very same copy in both apps, which the package manager guarantees
    // when the two lists are equal.
    const own = json(path.join(here, 'package.json'))
    const other = json(path.join(shared, 'package.json'))
    expect(own.dependencies).toEqual(other.dependencies)
    expect(own.devDependencies).toEqual(other.devDependencies)
  })

  it('has the same symbol as the copy the login page of the admin shows', () => {
    // The admin panel lives in the other app and shows the symbols of both sites.
    const file = 'public/brand/inspringtheater-symbol.svg'
    expect(readFileSync(path.join(here, file), 'utf8')).toBe(readFileSync(path.join(shared, file), 'utf8'))
  })

  it('has a route file for every shared route', () => {
    // Fails with the list of files to add, update or remove. Fix: node tools/site-routes/sync.mjs
    const run = () => execFileSync('node', [path.resolve(here, '../../tools/site-routes/sync.mjs'), '--check'], { encoding: 'utf8' })
    expect(run()).toContain('in step')
  })

  it('only gives its own colours to variables the shared design knows', () => {
    const declared = new Set([...readFileSync(path.join(shared, 'app/[locale]/site.css'), 'utf8').matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]))
    const own = [...readFileSync(path.join(here, 'app/[locale]/theme.css'), 'utf8').matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1])
    expect(own.length).toBeGreaterThan(0)
    expect(own.filter((name) => !declared.has(name))).toEqual([])
  })

  it('names the same languages in its own wording as the shared wording has', () => {
    for (const locale of ['en', 'nl']) {
      const sharedWords = json(path.join(shared, `messages/${locale}.json`))
      const ownWords = json(path.join(here, `messages/${locale}.json`))
      // Every section this app rewords exists in the shared wording.
      expect(Object.keys(ownWords).filter((section) => !(section in sharedWords))).toEqual([])
    }
  })
})
