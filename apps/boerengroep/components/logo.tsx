import React from 'react';

import { SITE } from '@/site.config';

/** Shown until a logo is chosen under Site settings. Each site names its own in `site.config.ts`. */
export const FALLBACK_LOGO = SITE.logo;

/** The version for the dark footer, used until one is chosen under Site settings. */
export const FALLBACK_LOGO_ON_DARK = SITE.logoOnDark;

/** The site logo as a plain image, so it also works when the address redirects. */
export function LogoImage({ src, name, className }: { src?: string; name: string; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src || FALLBACK_LOGO} alt={name} className={className} />;
}
