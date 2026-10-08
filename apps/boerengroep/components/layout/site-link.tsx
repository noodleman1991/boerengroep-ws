import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import type { SiteLink as SiteLinkData } from '@/lib/cms-adapters';

type Props = Omit<ComponentProps<'a'>, 'href'> & { link: Pick<SiteLinkData, 'href' | 'external'> };

/** A link from Site settings. Pages get the language prefix. Other websites open normally. */
export function SiteLink({ link, children, ...rest }: Props) {
    if (link.external) {
        return (
            <a href={link.href} rel="noopener noreferrer" {...rest}>
                {children}
            </a>
        );
    }
    return (
        <Link href={link.href as never} {...(rest as object)}>
            {children}
        </Link>
    );
}
