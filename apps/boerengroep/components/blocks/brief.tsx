'use client';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

/** A link that stays on the site in the reader's language, or opens another website. */
export function WidgetLink({ href, external, className, children }: { href: string; external?: boolean; className?: string; children: ReactNode }) {
    const t = useTranslations('widgets');
    if (!external) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }
    return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
            {children}
            <ExternalLink aria-hidden="true" className="brief__out" />
            <span className="sr-only"> ({t('elsewhere')})</span>
        </a>
    );
}

/**
 * One line in a short list on a page: a news item or a position. The whole row leads where
 * its title leads. `lead` shows it large, with its picture above.
 */
export function Brief({ href, external, title, meta, text, picture, lang, lead = false }: {
    href: string;
    external?: boolean;
    title: string;
    /** Small words above the title: a date, a kind. */
    meta?: ReactNode;
    text?: string;
    picture?: string;
    /** The language of the title and text, when it is not the language of the page. */
    lang?: string;
    lead?: boolean;
}) {
    return (
        <article className={`brief${lead ? ' brief--lead' : ''}${picture ? ' brief--pictured' : ''}`}>
            {picture && (
                <div className="brief__picture">
                    <Image src={picture} alt="" width={800} height={600} sizes={lead ? '(max-width: 900px) 100vw, 50vw' : '160px'} />
                </div>
            )}
            <div className="brief__body">
                {meta && <p className="brief__meta">{meta}</p>}
                <h3 className="brief__title" lang={lang}>
                    <WidgetLink href={href} external={external}>
                        {title}
                    </WidgetLink>
                </h3>
                {text && (
                    <p className="brief__text" lang={lang}>
                        {text}
                    </p>
                )}
            </div>
        </article>
    );
}
