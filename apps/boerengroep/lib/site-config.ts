/**
 * What makes one app "the Boerengroep site" or "the Inspringtheater site". Both apps run the
 * same pages and components. Everything that differs between them is either here, in the
 * app's own `site.config.ts`, or in Site settings in the admin panel.
 */
export type SiteConfig = {
  /** The short name of the site in the admin panel. It decides whose content this app shows. */
  tenant: string;
  /** Used until a name is filled in under Site settings. */
  name: string;
  /** The title of the home page in browser tabs and search results. */
  title: string;
  /** One line about the organisation, for search results, until one is filled in under Site settings. */
  description: string;
  /** Used until a logo is chosen under Site settings. An address under this app's `public` folder. */
  logo: string;
  /** The logo for the dark footer, until one is chosen under Site settings. */
  logoOnDark: string;
  /** The logo without its lettering, or null when the organisation has none. */
  symbol: string | null;
  /** The colour phones give the browser's own bar. */
  themeColor: string;
  /** Where visitors can write to, used in emails the site sends. */
  contactEmail: string;
};
