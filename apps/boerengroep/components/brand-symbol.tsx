'use client';
import { useLayout } from '@/components/layout/layout-context';

/** The swirl of the logo without its lettering, used until a symbol is chosen under Site settings. */
export const FALLBACK_SYMBOL = '/brand/boerengroep-symbol.svg';

/**
 * The symbol of the organisation as decoration. It carries no name for screen readers:
 * the logo with the name is in the header.
 */
export function BrandSymbol({ className }: { className?: string }) {
    const { globalSettings } = useLayout();
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={globalSettings?.symbol || FALLBACK_SYMBOL} alt="" aria-hidden="true" className={className} />;
}
