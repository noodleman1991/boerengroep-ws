import React from 'react';

/**
 * Shown until a logo is chosen under Site settings. The address is a legacy upload path,
 * which the site redirects to the stored file.
 */
export const FALLBACK_LOGO = '/uploads/branding/boerengroep-logo-zwart.png';

/** The site logo as a plain image, so it also works when the address redirects. */
export function LogoImage({ src, name, className }: { src?: string; name: string; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src || FALLBACK_LOGO} alt={name} className={className} />;
}
