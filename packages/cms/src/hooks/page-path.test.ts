import { describe, expect, it } from 'vitest'
import { buildPath } from './page-path'

describe('buildPath', () => {
  it('puts a root page under a single slash', () => {
    expect(buildPath(null, 'contact')).toBe('/contact')
  })
  it('maps the root page called home to the site root', () => {
    expect(buildPath(null, 'home')).toBe('/')
  })
  it('joins a child to its parent path', () => {
    expect(buildPath('/over-ons', 'geschiedenis')).toBe('/over-ons/geschiedenis')
  })
  it('does not double the slash under the home page', () => {
    expect(buildPath('/', 'contact')).toBe('/contact')
  })
  it('treats a nested page called home as an ordinary slug', () => {
    expect(buildPath('/library', 'home')).toBe('/library/home')
  })
})
