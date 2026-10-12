import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BrandSymbol } from '@/components/brand-symbol';
import { SITE } from '@/site.config';

/**
 * How to leave the newsletter, and how to see or erase what is kept about you. Brevo keeps
 * the list, so leaving happens through the link in every newsletter, and a question about
 * someone's data goes to the organisation. The site has nothing of its own to show or erase.
 */
export async function NewsletterHelpPage({ locale, about }: { locale: string; about: 'unsubscribe' | 'yourData' }) {
    const t = await getTranslations({ locale, namespace: `newsletter.${about}` });
    const write = (chunks: React.ReactNode) => <a className="rich-link" href={`mailto:${SITE.contactEmail}`}>{chunks}</a>;

    return (
        <div className="page-width">
            <div className="notice">
                <BrandSymbol className="notice__mark" />
                <h1>{t('title')}</h1>
                <div className="notice__text">
                    <p>{t('how')}</p>
                    <p>{t.rich('write_to_us', { email: SITE.contactEmail, write })}</p>
                </div>
                <div className="notice__actions">
                    <Link href="/" className="btn-quiet">
                        {t('back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
