'use client';
import React, { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { OverprintMark } from '@/components/overprint-mark';

interface DeleteDataPageProps {
    locale: string;
    /** The personal link from the email. With it the deletion can happen. */
    token?: string;
}

type State = 'idle' | 'sending' | 'email-sent' | 'deleted' | 'invalid' | 'error';

/**
 * Deleting takes two steps. First someone gives their address and gets a link by email.
 * Only that link deletes, so nobody can remove someone else from the list.
 */
export const DeleteDataPage = ({ locale, token }: DeleteDataPageProps) => {
    const t = useTranslations('newsletter.deleteData');
    const [state, setState] = useState<State>('idle');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [understood, setUnderstood] = useState(false);
    const emailId = useId();
    const reasonId = useId();
    const understoodId = useId();

    const send = async (body: Record<string, unknown>) => {
        setState('sending');
        try {
            const response = await fetch('/api/newsletter/delete-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, language: locale, reason: reason || undefined }),
            });
            const result = await response.json().catch(() => null);
            if (response.ok) setState(result?.status === 'deleted' ? 'deleted' : 'email-sent');
            else setState(response.status === 400 && token ? 'invalid' : 'error');
        } catch {
            setState('error');
        }
    };

    const whatGoes = (
        <ul className="notice__list" aria-label={t('what_deleted')}>
            <li>{t('deleted_subscription')}</li>
            <li>{t('deleted_consent')}</li>
            <li>{t('deleted_preferences')}</li>
            <li>{t('deleted_communications')}</li>
        </ul>
    );

    if (state === 'deleted' || state === 'email-sent' || state === 'invalid') {
        const copy = {
            deleted: [t('success_title'), t('success_message')],
            'email-sent': [t('check_email_title'), t('check_email_message')],
            invalid: [t('confirm_title'), t('invalid_link')],
        }[state];
        return (
            <div className="page-width">
                <div className="notice" role="status">
                    <OverprintMark className="notice__mark" />
                    <h1>{copy[0]}</h1>
                    <p className="notice__text">{copy[1]}</p>
                    <div className="notice__actions">
                        <Link href="/" className="btn-quiet">
                            {t('back_home')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (token) {
        return (
            <div className="page-width">
                <div className="notice">
                    <OverprintMark className="notice__mark" />
                    <h1>{t('confirm_title')}</h1>
                    <p className="notice__text">{t('confirm_description')}</p>
                    {whatGoes}
                    <p className="notice__text" style={{ marginTop: '1.25rem' }}>
                        {t('warning_message')}
                    </p>
                    {state === 'error' && (
                        <p className="notice__problem" role="alert">
                            {t('error_message')}
                        </p>
                    )}
                    <div className="notice__actions">
                        <button type="button" className="btn-ink" disabled={state === 'sending'} onClick={() => send({ token })}>
                            {t('confirm_button')}
                        </button>
                        <Link href="/" className="btn-quiet">
                            {t('back_home')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-width">
            <div className="notice">
                <OverprintMark className="notice__mark" />
                <h1>{t('title')}</h1>
                <p className="notice__text">{t('description')}</p>
                {whatGoes}
                <form
                    className="notice-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        send({ email, confirmation: understood });
                    }}
                >
                    <label htmlFor={emailId}>{t('email_label')}</label>
                    <input
                        id={emailId}
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={t('email_placeholder')}
                    />
                    <label htmlFor={reasonId}>{t('reason_label')}</label>
                    <textarea
                        id={reasonId}
                        rows={3}
                        maxLength={1000}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder={t('reason_placeholder')}
                    />
                    <div className="notice-form__check">
                        <input
                            id={understoodId}
                            type="checkbox"
                            required
                            checked={understood}
                            onChange={(event) => setUnderstood(event.target.checked)}
                        />
                        <label htmlFor={understoodId}>{t('confirmation_text')}</label>
                    </div>
                    {state === 'error' && (
                        <p className="notice__problem" role="alert">
                            {t('error_message')}
                        </p>
                    )}
                    <div className="notice__actions">
                        <button type="submit" className="btn-ink" disabled={state === 'sending'}>
                            {t('confirm_delete')}
                        </button>
                    </div>
                </form>
                <p className="notice__text" style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
                    {t('gdpr_notice')}
                </p>
            </div>
        </div>
    );
};
