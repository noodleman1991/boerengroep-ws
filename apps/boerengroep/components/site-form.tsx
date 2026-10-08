'use client';
import { useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { RichText } from '@/components/rich-text';
import type { FieldProblem, FormField } from '@/lib/forms';
import { hasRichText } from '@/lib/rich-text-utils';

export type SiteFormData = {
    id: number | string;
    fields?: FormField[] | null;
    submitButtonLabel?: string | null;
    confirmationType?: 'message' | 'redirect' | null;
    confirmationMessage?: unknown;
    redirect?: { url?: string | null } | null;
};

type State = 'idle' | 'sending' | 'sent' | 'error' | 'too-many';

/** Columns out of twelve for a field that editors set to a percentage of the width. */
const span = (width: number | null | undefined) => Math.min(12, Math.max(3, Math.round(((width ?? 100) / 100) * 12)));

/** A form built in the admin panel. Answers go to this site's own route, which checks them again. */
export function SiteForm({ form }: { form: SiteFormData }) {
    const t = useTranslations('forms');
    const id = useId();
    const startedAt = useRef(0);
    const doneRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<State>('idle');
    const [problems, setProblems] = useState<Record<string, FieldProblem>>({});

    useEffect(() => {
        startedAt.current = Date.now();
    }, []);
    useEffect(() => {
        if (state === 'sent') doneRef.current?.focus();
    }, [state]);

    const fields = (form.fields ?? []).filter((field) => field.blockType === 'message' || field.name);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const values: Record<string, unknown> = {};
        for (const field of fields) {
            if (!field.name) continue;
            values[field.name] = field.blockType === 'checkbox' ? data.get(field.name) === 'on' : (data.get(field.name) ?? '');
        }
        setState('sending');
        setProblems({});
        try {
            const response = await fetch('/api/form-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ form: form.id, values, website: data.get('website') ?? '', elapsedMs: Date.now() - startedAt.current }),
            });
            const body = await response.json().catch(() => null);
            if (response.ok) {
                const target = form.confirmationType === 'redirect' ? form.redirect?.url?.trim() : undefined;
                if (target && (target.startsWith('/') || /^https?:\/\//i.test(target))) {
                    window.location.assign(target);
                    return;
                }
                setState('sent');
            } else if (response.status === 400 && body?.fields) {
                setProblems(body.fields);
                setState('idle');
            } else {
                setState(response.status === 429 ? 'too-many' : 'error');
            }
        } catch {
            setState('error');
        }
    };

    if (state === 'sent') {
        return (
            <div className="site-form__done" ref={doneRef} tabIndex={-1} role="status">
                {hasRichText(form.confirmationMessage) ? (
                    <RichText data={form.confirmationMessage} />
                ) : (
                    <>
                        <strong>{t('sent_title')}</strong>
                        <p>{t('sent_text')}</p>
                    </>
                )}
            </div>
        );
    }

    const hasProblems = Object.keys(problems).length > 0;

    return (
        <form className="site-form" onSubmit={onSubmit} noValidate>
            {hasProblems && (
                <p className="site-form__notice" role="alert">
                    {t('fix')}
                </p>
            )}
            <div className="site-form__grid">
                {fields.map((field, index) => {
                    const style = { '--span': span(field.width) } as React.CSSProperties;
                    if (field.blockType === 'message') {
                        return (
                            <div key={index} className="site-form__message" style={style}>
                                <RichText data={field.message} />
                            </div>
                        );
                    }
                    const name = field.name!;
                    const fieldId = `${id}-${name}`;
                    const problem = problems[name];
                    const shared = {
                        id: fieldId,
                        name,
                        required: Boolean(field.required),
                        'aria-invalid': Boolean(problem),
                        'aria-describedby': problem ? `${fieldId}-problem` : undefined,
                        defaultValue: typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number' ? field.defaultValue : undefined,
                    };
                    const label = (
                        <>
                            {field.label || name}
                            {!field.required && <span className="site-form__optional"> ({t('optional')})</span>}
                        </>
                    );
                    return (
                        <div key={name} className={`site-form__field${problem ? ' site-form__field--problem' : ''}`} style={style}>
                            {field.blockType === 'checkbox' ? (
                                <div className="site-form__check">
                                    <input
                                        type="checkbox"
                                        id={fieldId}
                                        name={name}
                                        required={Boolean(field.required)}
                                        defaultChecked={field.defaultValue === true}
                                        aria-invalid={Boolean(problem)}
                                        aria-describedby={problem ? `${fieldId}-problem` : undefined}
                                    />
                                    <label htmlFor={fieldId}>{label}</label>
                                </div>
                            ) : (
                                <>
                                    <label htmlFor={fieldId}>{label}</label>
                                    {field.blockType === 'textarea' ? (
                                        <textarea rows={5} {...shared} />
                                    ) : field.blockType === 'select' ? (
                                        <select {...shared} defaultValue={shared.defaultValue ?? ''}>
                                            <option value="">{t('choose')}</option>
                                            {(field.options ?? []).map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.blockType === 'email' ? 'email' : 'text'}
                                            inputMode={field.blockType === 'number' ? 'decimal' : undefined}
                                            autoComplete={field.blockType === 'email' ? 'email' : undefined}
                                            {...shared}
                                        />
                                    )}
                                </>
                            )}
                            {problem && (
                                <p id={`${fieldId}-problem`} className="site-form__problem">
                                    {t(`problems.${problem}`)}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* People never see this field. A robot that fills it in gives itself away. */}
            <div className="site-form__trap" aria-hidden="true">
                <label htmlFor={`${id}-website`}>{t('trap')}</label>
                <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {(state === 'error' || state === 'too-many') && (
                <p className="site-form__notice" role="alert">
                    {t(state === 'error' ? 'error' : 'too_many')}
                </p>
            )}
            <button type="submit" className="btn-leaf" disabled={state === 'sending'}>
                {state === 'sending' ? t('sending') : form.submitButtonLabel || t('send')}
            </button>
        </form>
    );
}
