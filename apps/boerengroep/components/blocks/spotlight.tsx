'use client';
import type { SpotlightBlock } from '@sites/cms/types';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { dayKey, formatDate } from '@/lib/events/time';
import { type SpotlightCard, spotlightCards } from '@/lib/spotlight';
import { Section } from '../layout/section';
import { WidgetLink } from './brief';

/**
 * What an editor chose to put in front of visitors. One thing shows large, with its picture
 * beside the words. Two or three stand side by side.
 */
export const Spotlight = ({ data }: { data: SpotlightBlock }) => {
    const cards = spotlightCards(data.items);
    if (cards.length === 0) return null;
    const single = cards.length === 1;
    // On green and orange a black button reads better than a green one.
    const tone = data.background === 'leaf' || data.background === 'harvest' ? 'ink' : 'leaf';
    return (
        <Section background={data.background}>
            {data.title && (
                <div className="block-head">
                    <h2>{data.title}</h2>
                </div>
            )}
            <div className={`spots spots--${cards.length}`}>
                {cards.map((card) => (
                    <Spot key={card.key} card={card} large={single} heading={data.title ? 'h3' : 'h2'} tone={tone} />
                ))}
            </div>
        </Section>
    );
};

function Spot({ card, large, heading: Heading, tone }: { card: SpotlightCard; large: boolean; heading: 'h2' | 'h3'; tone: 'leaf' | 'ink' }) {
    const t = useTranslations('widgets.spotlight');
    const locale = useLocale() as 'en' | 'nl';
    const lang = card.language && card.language !== locale ? card.language : undefined;
    return (
        <article className={`spot${large ? ' spot--large' : ''}${card.picture ? '' : ' spot--plain'}`}>
            {card.picture && (
                <div className="spot__picture">
                    <Image src={card.picture} alt="" width={800} height={600} sizes={large ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 900px) 100vw, 33vw'} />
                </div>
            )}
            <div className="spot__body">
                <p className="spot__meta">
                    <span>{t(`kinds.${card.kind}`)}</span>
                    {card.date && <time dateTime={dayKey(card.date)}>{formatDate(card.date, locale)}</time>}
                </p>
                <Heading className="spot__title" lang={lang}>
                    {card.title}
                </Heading>
                {card.text && (
                    <p className="spot__text" lang={lang}>
                        {card.text}
                    </p>
                )}
                {/* The button names where it leads, so several "Read more" buttons can be told apart. */}
                <WidgetLink href={card.href} external={card.external} className={large ? `btn-${tone}` : 'btn-quiet'}>
                    {card.buttonLabel || t('more')}
                    <span className="sr-only">: {card.title}</span>
                </WidgetLink>
            </div>
        </article>
    );
}
