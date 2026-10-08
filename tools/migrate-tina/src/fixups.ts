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
}

export const emptyFixups: Fixups = { removePages: [], pageOverrides: {}, redirects: [], removeFiles: [], clearPageBodies: [], galleryPages: [] }

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
  }
}
