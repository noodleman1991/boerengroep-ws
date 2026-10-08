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
}

export const emptyFixups: Fixups = { removePages: [], pageOverrides: {}, redirects: [] }

/** Reads a fix-ups file, filling in the parts it leaves out. */
export function parseFixups(json: string): Fixups {
  const raw = JSON.parse(json) as Partial<Fixups>
  return {
    removePages: raw.removePages ?? [],
    pageOverrides: raw.pageOverrides ?? {},
    redirects: raw.redirects ?? [],
    logo: raw.logo,
  }
}
