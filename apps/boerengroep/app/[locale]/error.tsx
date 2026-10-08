'use client';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { OverprintMark } from '@/components/overprint-mark';
import { Link } from '@/i18n/navigation';

/** Shown when a page fails to load. It offers to try again and a way back to the home page. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = useTranslations('pageError');
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main id="content" className="page-width">
            <div className="notice">
                <OverprintMark className="notice__mark" />
                <h1>{t('title')}</h1>
                <p className="notice__text">{t('text')}</p>
                <div className="notice__actions">
                    <button type="button" className="btn-leaf" onClick={reset}>
                        {t('retry')}
                    </button>
                    <Link href="/" className="btn-quiet">
                        {t('home')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
