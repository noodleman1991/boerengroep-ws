'use client';
import type { NewsPreviewBlock } from '@sites/cms/types';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { dayKey, formatDate } from '@/lib/events/time';
import { latestNews, type NewsCard } from '@/lib/news';
import { Section } from '../layout/section';
import { useBlockData } from './block-data-context';
import { Brief } from './brief';

const LISTS = { all: '/news', own: '/news/newsletter', friends: '/news/friends-news' } as const;

/**
 * The newest news on a page. An item an editor put in the spotlight leads, large and with
 * its picture. The others follow as short rows. Without any news the block is not there.
 */
export const NewsPreview = ({ data }: { data: NewsPreviewBlock }) => {
    const t = useTranslations('widgets.news');
    const locale = useLocale() as 'en' | 'nl';
    const { news } = useBlockData();
    const which = data.which ?? 'all';
    const { lead, rest } = latestNews(news, { which, count: data.count, spotlightFirst: data.spotlightFirst });
    if (!lead && rest.length === 0) return null;

    const row = (card: NewsCard, isLead = false) => (
        <Brief
            key={card.id}
            lead={isLead}
            href={card.href}
            external={card.external}
            title={card.title}
            text={card.summary}
            picture={card.picture}
            lang={card.language && card.language !== locale ? card.language : undefined}
            meta={
                <>
                    <time dateTime={dayKey(card.date)}>{formatDate(card.date, locale)}</time>
                    {/* On a list of everything, say which items are not the site's own. */}
                    {which === 'all' && !card.own && <span>{t('from_friends')}</span>}
                </>
            }
        />
    );

    return (
        <Section background={data.background}>
            <div className="block-head">
                <div>
                    <h2>{data.title || t('title')}</h2>
                    {data.description && <p>{data.description}</p>}
                </div>
                <Link href={LISTS[which]} className="btn-quiet">
                    {t('all')}
                </Link>
            </div>
            <div className={`briefs${lead && rest.length > 0 ? ' briefs--led' : ''}`}>
                {lead && row(lead, true)}
                {rest.length > 0 && <div className="brief-list">{rest.map((card) => row(card))}</div>}
            </div>
        </Section>
    );
};
