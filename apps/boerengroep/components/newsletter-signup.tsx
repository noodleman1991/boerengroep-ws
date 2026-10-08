'use client';
import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useLayout } from '@/components/layout/layout-context';
import { BrandSymbol } from '@/components/brand-symbol';
import { RichText } from '@/components/rich-text';
import { outcomeOf, type SignupOutcome } from '@/lib/newsletter/signup-state';
import { hasRichText } from '@/lib/rich-text-utils';

interface NewsletterSignupProps {
    /** Where the box sits, kept with the sign-up for the consent record. */
    source?: string;
    /** Overrides the heading and introduction from Site settings, for a box placed on a page. */
    heading?: string | null;
    intro?: string | null;
    headingLevel?: 'h2' | 'h3';
    /** `band` puts the words and the field side by side on a wide screen. */
    layout?: 'stack' | 'band';
    className?: string;
}

type State = 'idle' | 'sending' | SignupOutcome;

/**
 * The newsletter box. Editors set every text in Site settings, Newsletter.
 * A text they leave empty falls back to the standard wording.
 */
export function NewsletterSignup({
    source = 'website',
    heading,
    intro,
    headingLevel: Heading = 'h2',
    layout = 'stack',
    className = '',
}: NewsletterSignupProps) {
    const t = useTranslations('newsletter.signup');
    const locale = useLocale();
    const { globalSettings } = useLayout();
    const texts = globalSettings?.newsletter;
    const [state, setState] = useState<State>('idle');
    const [email, setEmail] = useState('');
    const fieldId = useId();
    const errorId = useId();
    const doneRef = useRef<HTMLDivElement>(null);

    const done = state === 'thanks' || state === 'already';
    useEffect(() => {
        // Move the reading position to the result, so a screen reader announces it.
        if (done) doneRef.current?.focus();
    }, [done]);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!event.currentTarget.checkValidity()) {
            setState('invalid');
            return;
        }
        setState('sending');
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, language: locale, source }),
            });
            setState(outcomeOf(response.status, await response.json().catch(() => null)));
        } catch {
            setState('error');
        }
    };

    if (done) {
        const custom = state === 'thanks' && hasRichText(texts?.thanksMessage);
        return (
            <div className={`signup signup--done ${className}`} ref={doneRef} tabIndex={-1} role="status">
                <BrandSymbol className="signup__mark" />
                <Heading className="signup__heading">
                    {state === 'already' ? t('already_title') : texts?.thanksTitle || t('thanks_title')}
                </Heading>
                {custom ? (
                    <RichText data={texts?.thanksMessage} className="signup__message" />
                ) : (
                    <p className="signup__message">{state === 'already' ? t('already_message') : t('thanks_message')}</p>
                )}
            </div>
        );
    }

    const problem = state === 'invalid' ? t('invalid_email') : state === 'error' ? t('error_message') : null;

    return (
        <div className={`signup signup--${layout} ${className}`}>
            <div className="signup__words">
                <Heading className="signup__heading">{heading || texts?.heading || t('title')}</Heading>
                <p className="signup__intro">{intro || texts?.intro || t('description')}</p>
            </div>

            <form onSubmit={onSubmit} noValidate className="signup__form">
                <label htmlFor={fieldId} className="sr-only">
                    {t('email_label')}
                </label>
                <div className="signup__pill">
                    <input
                        id={fieldId}
                        className="signup__input"
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            if (problem) setState('idle');
                        }}
                        placeholder={texts?.placeholder || t('email_placeholder')}
                        aria-invalid={state === 'invalid'}
                        aria-describedby={problem ? errorId : undefined}
                        disabled={state === 'sending'}
                    />
                    <button type="submit" className="btn-leaf signup__send" disabled={state === 'sending'}>
                        {state === 'sending' ? t('sending') : texts?.buttonLabel || t('submit_button')}
                    </button>
                </div>
                {problem && (
                    <p id={errorId} className="signup__problem" role="alert">
                        {problem}
                    </p>
                )}
                <p className="signup__small">
                    {texts?.consentText ? (
                        <>
                            {texts.consentText} <Link href="/privacy-policy">{t('privacy_policy')}</Link>
                        </>
                    ) : (
                        t.rich('consent_statement', {
                            privacyPolicy: (chunks) => <Link href="/privacy-policy">{chunks}</Link>,
                        })
                    )}
                </p>
            </form>
        </div>
    );
}
