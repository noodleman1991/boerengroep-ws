'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useLayout } from '@/components/layout/layout-context';
import { BrandSymbol } from '@/components/brand-symbol';
import { RichText } from '@/components/rich-text';
import { hasRichText } from '@/lib/rich-text-utils';

/**
 * Where Brevo sends someone after they clicked the button in the confirmation email.
 * Brevo has put them on the list by then. Editors set the texts in Site settings, Newsletter.
 */
export const ConfirmedPage = () => {
    const t = useTranslations('newsletter.verify');
    const texts = useLayout().globalSettings?.newsletter;

    return (
        <div className="page-width">
            <div className="notice">
                <BrandSymbol className="notice__mark" />
                <h1>{texts?.confirmedTitle || t('confirmed_title')}</h1>
                {hasRichText(texts?.confirmedMessage) ? (
                    <RichText data={texts?.confirmedMessage} className="notice__text" />
                ) : (
                    <p className="notice__text">{t('confirmed_message')}</p>
                )}
                <div className="notice__actions">
                    <Link href="/" className="btn-leaf">
                        {t('back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
};
