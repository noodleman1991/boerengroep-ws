'use client';
import { useLayout } from '@/components/layout/layout-context';
import { SITE } from '@/site.config';

/** The address of the organisation's symbol, or nothing for an organisation that has none. */
export function useBrandSymbol(): string | null {
    const { globalSettings } = useLayout();
    return globalSettings?.symbol || SITE.symbol;
}

/**
 * The symbol of the organisation as decoration. It carries no name for screen readers:
 * the logo with the name is in the header.
 */
export function BrandSymbol({ className }: { className?: string }) {
    const symbol = useBrandSymbol();
    // A site without a symbol simply shows none.
    if (!symbol) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={symbol} alt="" aria-hidden="true" className={className} />;
}
