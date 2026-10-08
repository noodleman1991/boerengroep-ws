'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Section } from '@/components/layout/section';
import { FileCard } from '@/components/media/file-card';
import { RichText } from '@/components/rich-text';
import { formatDay, type SiteLocale } from '@/lib/events/time';
import type { FileInfo } from '@/lib/files';
import { hasRichText } from '@/lib/rich-text-utils';
import { groupVacancies, vacancyAnchor, type VacancyGroup } from '@/lib/vacancies';

/** A vacancy as the page reads it. Every part is optional except the title. */
export type VacancyItem = {
    id: string;
    slug?: string | null;
    title?: string | null;
    opportunityType?: string | null;
    location?: { type?: string | null; cityRegion?: string | null } | null;
    startDate?: string | null;
    duration?: string | null;
    openApplication?: boolean | null;
    applicationDeadline?: string | null;
    description?: unknown;
    responsibilities?: unknown;
    requiredSkills?: (string | null)[] | null;
    preferredQualities?: unknown;
    languagesRequired?: (string | null)[] | null;
    compensation?: { details?: string | null } | null;
    accessibilityNotes?: string | null;
    howToApply?: unknown;
    contactInfo?: { name?: string | null; email?: string | null; phone?: string | null } | null;
    document?: FileInfo | null;
    valuesStatement?: unknown;
    openToNontraditional?: boolean | null;
};

const words = (list: (string | null)[] | null | undefined) => (list ?? []).map((item) => item?.trim()).filter((item): item is string => Boolean(item));
const anchor = vacancyAnchor;

/**
 * Every position people can apply for, grouped by kind. Whether a vacancy is open follows from
 * what the editor set: always open, open until a day, or closed for a few days before it leaves
 * the page. Kinds without a vacancy are named at the end, so links to them still land somewhere.
 */
export function VacanciesPage({ vacancies, locale, renderedAt }: {
    vacancies: VacancyItem[];
    locale: string;
    /** When the page was built. Used until the browser's own clock takes over. */
    renderedAt: string;
}) {
    const t = useTranslations('vacancies');
    const [now, setNow] = useState(() => new Date(renderedAt));
    useEffect(() => {
        // The page may have been built a while ago. A deadline may have passed since.
        setNow(new Date());
        // A link to one vacancy opens it, on arrival and when only the part after # changes.
        const openLinked = () => {
            const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
            if (target instanceof HTMLDetailsElement) {
                target.open = true;
                target.scrollIntoView();
            }
        };
        openLinked();
        window.addEventListener('hashchange', openLinked);
        return () => window.removeEventListener('hashchange', openLinked);
    }, []);

    const groups = groupVacancies(vacancies, now, { includeEmpty: true });
    const filled = groups.filter((group) => group.items.length > 0);
    // "Other" is a rest group. Saying there is nothing "for other" helps nobody.
    const empty = groups.filter((group) => group.items.length === 0 && group.kind !== 'other');

    return (
        <>
            <Section className="page-head">
                <h1>{t('title')}</h1>
                <p className="page-head__intro">{t('description')}</p>
                {filled.length > 1 && (
                    <nav className="chips" aria-label={t('kinds_nav')}>
                        {filled.map((group) => (
                            <a key={group.kind} className="chip" href={`#${group.kind}`}>
                                {t(`types.${group.kind}.navTitle`)}
                                <span className="chip__count" aria-hidden="true">
                                    {group.open}
                                </span>
                            </a>
                        ))}
                    </nav>
                )}
            </Section>

            {filled.length === 0 ? (
                <Section background="mist" className="vacancy-none">
                    <h2>{t('none_title')}</h2>
                    <p>{t('none_text')}</p>
                </Section>
            ) : (
                <Section className="vacancy-groups">
                    {filled.map((group) => (
                        <VacancyGroupList key={group.kind} group={group} locale={locale as SiteLocale} />
                    ))}
                    {empty.length > 0 && (
                        <p className="vacancy-missing">
                            {t('none_for')}{' '}
                            {empty.map((group, index) => (
                                <span key={group.kind} id={group.kind}>
                                    {t(`types.${group.kind}.navTitle`).toLowerCase()}
                                    {index < empty.length - 1 ? ', ' : '.'}
                                </span>
                            ))}
                        </p>
                    )}
                </Section>
            )}
        </>
    );
}

function VacancyGroupList({ group, locale }: { group: VacancyGroup<VacancyItem>; locale: SiteLocale }) {
    const t = useTranslations('vacancies');
    return (
        <section className="vacancy-group" id={group.kind} aria-labelledby={`${group.kind}-title`}>
            <div className="vacancy-group__head">
                <h2 id={`${group.kind}-title`}>{t(`types.${group.kind}.title`)}</h2>
                <p>{t('open_count', { count: group.open })}</p>
            </div>
            <div className="vacancy-list">
                {group.items.map(({ vacancy, state, deadline }) => (
                    <Vacancy key={vacancy.id} vacancy={vacancy} state={state} deadline={deadline} locale={locale} />
                ))}
            </div>
        </section>
    );
}

function Vacancy({ vacancy, state, deadline, locale }: {
    vacancy: VacancyItem;
    state: 'open' | 'until' | 'closed';
    deadline?: string;
    locale: SiteLocale;
}) {
    const t = useTranslations('vacancies');
    const tMedia = useTranslations('media');
    const date = (value: string) =>
        new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(new Date(value));
    const closed = state === 'closed';
    const place = [vacancy.location?.cityRegion?.trim(), vacancy.location?.type ? t(`place.${vacancy.location.type}`) : undefined].filter(Boolean).join(', ');
    const skills = words(vacancy.requiredSkills);
    const languages = words(vacancy.languagesRequired);
    const contact = vacancy.contactInfo;
    const hasContact = Boolean(contact?.name?.trim() || contact?.email?.trim() || contact?.phone?.trim());

    // The short facts at the top. Only what the editor filled in is shown.
    const facts: [string, string][] = [];
    if (state === 'open') facts.push([t('fields.deadline'), t('always_open')]);
    else if (deadline) facts.push([t('fields.deadline'), formatDay(deadline, locale)]);
    if (vacancy.startDate) facts.push([t('fields.startDate'), date(vacancy.startDate)]);
    if (vacancy.duration?.trim()) facts.push([t('fields.duration'), vacancy.duration.trim()]);
    if (place) facts.push([t('fields.location'), place]);

    const text = (label: string, value: unknown) =>
        hasRichText(value) ? (
            <section>
                <h4>{label}</h4>
                <RichText data={value as never} className="rich" headingsFrom={5} />
            </section>
        ) : null;
    const plain = (label: string, value: string | null | undefined) =>
        value?.trim() ? (
            <section>
                <h4>{label}</h4>
                <p>{value.trim()}</p>
            </section>
        ) : null;
    const list = (label: string, items: string[]) =>
        items.length > 0 ? (
            <section>
                <h4>{label}</h4>
                <ul className="vacancy__words">
                    {items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>
        ) : null;

    return (
        <details className={`vacancy${closed ? ' vacancy--closed' : ''}`} id={anchor(vacancy)}>
            <summary>
                <span className="vacancy__name">
                    <h3>{vacancy.title?.trim()}</h3>
                    <span className={`vacancy__state vacancy__state--${state}`}>
                        {state === 'until' && deadline ? t('status.until', { date: formatDay(deadline, locale) }) : t(`status.${closed ? 'closed' : 'open'}`)}
                    </span>
                </span>
                {(place || vacancy.duration?.trim()) && <span className="vacancy__teaser">{[place, vacancy.duration?.trim()].filter(Boolean).join(' · ')}</span>}
            </summary>

            <div className="vacancy__body">
                {closed && <p className="vacancy__closed-note">{t('closed_note')}</p>}
                {facts.length > 0 && (
                    <dl className="vacancy__facts">
                        {facts.map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>
                )}
                {text(t('fields.description'), vacancy.description)}
                {text(t('fields.responsibilities'), vacancy.responsibilities)}
                {list(t('fields.requiredSkills'), skills)}
                {text(t('fields.preferredQualities'), vacancy.preferredQualities)}
                {list(t('fields.languagesRequired'), languages)}
                {plain(t('fields.compensation'), vacancy.compensation?.details)}
                {plain(t('fields.accessibilityNotes'), vacancy.accessibilityNotes)}
                {text(t('fields.valuesStatement'), vacancy.valuesStatement)}
                {vacancy.openToNontraditional && <p className="vacancy__welcome">{t('nontraditional')}</p>}
                {vacancy.document && (
                    <section>
                        <h4>{t('fields.supportingDocument')}</h4>
                        <FileCard file={vacancy.document} downloadLabel={tMedia('download')} />
                    </section>
                )}
                {!closed && (hasRichText(vacancy.howToApply) || hasContact) && (
                    <section className="vacancy__apply">
                        <h4>{t('fields.howToApply')}</h4>
                        {hasRichText(vacancy.howToApply) && <RichText data={vacancy.howToApply as never} className="rich" headingsFrom={5} />}
                        {hasContact && (
                            <address>
                                <span className="vacancy__contact-label">{t('fields.contactInfo')}</span>
                                {contact?.name?.trim() && <span>{contact.name.trim()}</span>}
                                {contact?.email?.trim() && <a href={`mailto:${contact.email.trim()}`}>{contact.email.trim()}</a>}
                                {contact?.phone?.trim() && <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone.trim()}</a>}
                            </address>
                        )}
                    </section>
                )}
            </div>
        </details>
    );
}
