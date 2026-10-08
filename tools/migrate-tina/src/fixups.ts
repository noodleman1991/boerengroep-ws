import type { AddedBlock } from './add-blocks'

/**
 * Hand-written corrections applied while importing one site. They record editorial
 * decisions that the old content cannot express, such as a renamed page.
 */
export type Fixups = {
  /** Page keys (English path without a leading slash) that are not imported, and are removed if present. */
  removePages: string[]
  /** Title or slug per language for a page key. Other fields come from the content file. */
  pageOverrides: Record<string, Partial<Record<'en' | 'nl', { title?: string; slug?: string }>>>
  /** Permanent redirects to add, for addresses that stop existing. */
  redirects: { from: string; to: string }[]
  /** Upload path of the logo to use when the old settings point at a file that does not exist. */
  logo?: string
  /**
   * Content files that are not imported, and whose item is removed if an earlier run imported it.
   * For placeholder content the old site still carries, for example `events/nl/what.mdx`.
   * `speakers/*` names every file in a folder.
   * Pages go in `removePages`, because a page is made of two files.
   */
  removeFiles: string[]
  /** Page keys whose hidden text (the body, which the old site never showed) is left out. */
  clearPageBodies: string[]
  /**
   * Page keys whose text blocks are really photo pages: a heading, then pictures with a
   * sentence under each. They become gallery blocks, and the sentences become captions.
   */
  galleryPages: string[]
  /**
   * This site's own English to Dutch address words, added to the shared list. They pair an
   * English page with its Dutch one, for example `get-involved` with `doe-mee`.
   */
  segments: Record<string, string>
  /** Leaves out pages that have nothing on them, unless a page with content sits under them. */
  skipEmptyPages: boolean
  /** The colour of each kind of event the old site knew, by its old value. Names come from the old translation files. */
  kindColours: Record<string, string>
  /** Leaves menu and footer links out that lead to a page that is not on the new site. */
  dropDeadMenuLinks: boolean
  /**
   * Blocks the new site adds to an imported page, per page key, in both languages. For blocks
   * that fill themselves, such as the latest news. Texts are left empty, so the site's own
   * wording shows in each language.
   */
  addBlocks: Record<string, AddedBlock[]>
}

/** True when a content file is named in `removeFiles`, by itself or by its folder (`speakers/*`). */
export function isRemoved(file: string, removeFiles: string[]): boolean {
  return removeFiles.some((entry) => (entry.endsWith('/*') ? file.startsWith(entry.slice(0, -1)) : entry === file))
}

export const emptyFixups: Fixups = { removePages: [], pageOverrides: {}, redirects: [], removeFiles: [], clearPageBodies: [], galleryPages: [], segments: {}, skipEmptyPages: false, kindColours: {}, dropDeadMenuLinks: false, addBlocks: {} }

/** Reads a fix-ups file, filling in the parts it leaves out. */
export function parseFixups(json: string): Fixups {
  const raw = JSON.parse(json) as Partial<Fixups>
  return {
    removePages: raw.removePages ?? [],
    pageOverrides: raw.pageOverrides ?? {},
    redirects: raw.redirects ?? [],
    logo: raw.logo,
    removeFiles: raw.removeFiles ?? [],
    clearPageBodies: raw.clearPageBodies ?? [],
    galleryPages: raw.galleryPages ?? [],
    segments: raw.segments ?? {},
    skipEmptyPages: raw.skipEmptyPages ?? false,
    kindColours: raw.kindColours ?? {},
    dropDeadMenuLinks: raw.dropDeadMenuLinks ?? false,
    addBlocks: raw.addBlocks ?? {},
  }
}
