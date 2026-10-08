import type { SiteConfig } from '@/lib/site-config';

/** This app is the Inspringtheater site. Its pages and components are the shared ones in apps/boerengroep. */
export const SITE: SiteConfig = {
  tenant: 'inspringtheater',
  name: 'Stichting Inspringtheater',
  title: 'Stichting Inspringtheater Wageningen',
  description: 'Forum theatre and Theatre of the Oppressed in Wageningen: courses, jump-in sessions and plays.',
  logo: '/brand/inspringtheater-logo.png',
  logoOnDark: '/brand/inspringtheater-logo-on-dark.png',
  // The swirl of the logo without its lettering, drawn from the logo picture. See tools/brand-symbol.
  symbol: '/brand/inspringtheater-symbol.svg',
  themeColor: '#FF7A00',
  contactEmail: 'st.inspringtheater@wur.nl',
};
