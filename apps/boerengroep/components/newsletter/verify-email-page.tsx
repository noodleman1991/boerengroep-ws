'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useLayout } from '@/components/layout/layout-context';
import { OverprintMark } from '@/components/overprint-mark';
import { RichText } from '@/components/rich-text';
import { hasRichText } from '@/lib/rich-text-utils';

interface VerifyEmailPageProps {
    locale: string;
    token?: string;
}

type State = 'missing' | 'confirming' | 'confirmed' | 'invalid' | 'error';

/** Where the link in the confirmation email lands. Editors set the texts shown after confirming. */
export const VerifyEmailPage = ({ locale, token }: VerifyEmailPageProps) => {
    const t = useTranslations('newsletter.verify');
    const texts = useLayout().globalSettings?.newsletter;
    const [state, setState] = useState<State>(token ? 'confirming' : 'missing');

    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        fetch('/api/newsletter/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, language: locale }),
        })
            .then((response) => {
                if (cancelled) return;
                setState(response.ok ? 'confirmed' : response.status === 400 ? 'invalid' : 'error');
            })
            .catch(() => {
                if (!cancelled) setState('error');
            });
        return () => {
            cancelled = true;
        };
    }, [token, locale]);

    const title =
        state === 'confirmed'
            ? texts?.confirmedTitle || t('confirmed_title')
            : state === 'invalid'
              ? t('invalid_title')
              : t('title');

    return (
        <div className="page-width">
            <div className="notice" aria-live="polite" aria-busy={state === 'confirming'}>
                <OverprintMark className="notice__mark" />
                <h1>{title}</h1>
                {state === 'confirmed' && hasRichText(texts?.confirmedMessage) ? (
                    <RichText data={texts?.confirmedMessage} className="notice__text" />
                ) : (
                    <p className="notice__text">
                        {state === 'confirmed' && t('confirmed_message')}
                        {state === 'confirming' && t('verifying')}
                        {state === 'missing' && t('no_token')}
                        {state === 'invalid' && t('invalid_message')}
                        {state === 'error' && t('error_message')}
                    </p>
                )}
                {state !== 'confirming' && (
                    <div className="notice__actions">
                        <Link href="/" className={state === 'confirmed' ? 'btn-leaf' : 'btn-quiet'}>
                            {t('back_home')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
