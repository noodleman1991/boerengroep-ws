'use client';
import type { VacanciesPreviewBlock } from '@sites/cms/types';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatDay } from '@/lib/events/time';
import { openPositions, VACANCY_KINDS } from '@/lib/vacancies';
import { Section } from '../layout/section';
import { useBlockData } from './block-data-context';
import { Brief } from './brief';

/**
 * The positions people can apply for right now. Which ones are open follows from what the
 * editor set on each vacancy, by the same rules as the positions page.
 */
export const VacanciesPreview = ({ data }: { data: VacanciesPreviewBlock }) => {
    const t = useTranslations('widgets.positions');
    const tv = useTranslations('vacancies');
    const locale = useLocale() as 'en' | 'nl';
    const { positions, renderedAt } = useBlockData();
    const open = openPositions(positions, new Date(renderedAt), data.count ?? 3);
    if (open.length === 0 && data.whenNone !== 'say') return null;

    return (
        <Section background={data.background}>
            <div className="block-head">
                <div>
                    <h2>{data.title || t('title')}</h2>
                    {data.description && <p>{data.description}</p>}
                </div>
                <Link href="/vacancies" className="btn-quiet">
                    {t('all')}
                </Link>
            </div>
            {open.length === 0 ? (
                <p className="briefs__empty">{tv('none_text')}</p>
            ) : (
                <div className="brief-list brief-list--columns">
                    {open.map(({ vacancy, deadline }) => (
                        <Brief
                            key={vacancy.id}
                            href={`/vacancies#${vacancy.anchor}`}
                            title={vacancy.title}
                            meta={
                                <>
                                    <span>{tv(`types.${(VACANCY_KINDS as readonly string[]).includes(vacancy.kind) ? vacancy.kind : 'other'}.navTitle`)}</span>
                                    <span>{deadline ? tv('status.until', { date: formatDay(deadline, locale) }) : tv('always_open')}</span>
                                </>
                            }
                        />
                    ))}
                </div>
            )}
        </Section>
    );
};
