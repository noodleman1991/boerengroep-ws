'use client';
import type { EventsCalendarPreviewBlock } from '@sites/cms/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BrandSymbol, useBrandSymbol } from '@/components/brand-symbol';
import { DateBlock, EventFacts, KindTag, StatusBadge, useEventLang } from '@/components/events/event-bits';
import { EventRow } from '@/components/events/event-row';
import { MiniMonth } from '@/components/events/mini-month';
import { Link } from '@/i18n/navigation';
import { eventPath } from '@/lib/events/ics-site';
import { pickEvents, splitEvents } from '@/lib/events/select';
import type { SiteEvent } from '@/lib/events/types';
import { excerpt } from '@/lib/page-meta';
import { Section } from '../layout/section';
import { useBlockData } from './block-data-context';

type Ref = number | string | { id: number | string } | null | undefined;
const refId = (ref: Ref) => (ref && typeof ref === 'object' ? ref.id : ref);

/**
 * The "What's on" band. The first event is shown large with its picture and the date on
 * the corner, the following ones as short rows beside it.
 */
export const EventsCalendarPreview = ({ data }: { data: EventsCalendarPreviewBlock }) => {
    const t = useTranslations('calendar.band');
    const { events, renderedAt } = useBlockData();
    const now = new Date(renderedAt);

    const mode = data.mode ?? 'upcoming';
    const chosen = pickEvents(
        events,
        {
            mode,
            kind: refId(data.kind as Ref),
            picked: (data.events ?? []).flatMap((ref) => refId(ref as Ref) ?? []),
            count: mode === 'picked' ? 12 : (data.count ?? 4),
            orRecent: true,
        },
        now,
    );
    // When nothing is coming the band shows what happened most recently, and says so.
    const looksBack = mode !== 'picked' && chosen.length > 0 && splitEvents(chosen, now).upcoming.length === 0;
    const [lead, ...rest] = chosen;
    const showMonth = data.showMiniCalendar !== false;

    return (
        <Section background={data.background}>
            <div className="whats-on">
                <div className="whats-on__head">
                    <div>
                        <h2>{data.title || (looksBack ? t('recent_title') : t('title'))}</h2>
                        {data.description && <p>{data.description}</p>}
                    </div>
                    <Link href="/activities/calendar" className="btn-quiet">
                        {t('all')}
                    </Link>
                </div>

                {!lead ? (
                    <p className="whats-on__empty">{t('empty')}</p>
                ) : (
                    <div className={`whats-on__grid${rest.length > 0 || showMonth ? ' whats-on__grid--split' : ''}`}>
                        <LeadEvent event={lead} />
                        {(rest.length > 0 || showMonth) && (
                            <div className="whats-on__side">
                                {rest.length > 0 && (
                                    <div className="event-list">
                                        {rest.map((event) => (
                                            <EventRow key={event.id} event={event} compact />
                                        ))}
                                    </div>
                                )}
                                {showMonth && <MiniMonth events={events} now={now} />}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
};

function LeadEvent({ event }: { event: SiteEvent }) {
    const lang = useEventLang(event);
    const symbol = useBrandSymbol();
    // Without a picture, and on a site without a symbol, there is nothing to frame: the date leads.
    const framed = Boolean(event.image?.card || symbol);
    return (
        <article className={`whats-on__lead${framed ? '' : ' whats-on__lead--plain'}`}>
            <div className="whats-on__lead-frame">
                {framed && (
                    <div className="whats-on__lead-picture">
                        {event.image?.card ? (
                            <Image src={event.image.card} alt="" width={800} height={600} sizes="(max-width: 900px) 100vw, 50vw" />
                        ) : (
                            <BrandSymbol className="whats-on__lead-symbol" />
                        )}
                    </div>
                )}
                <div className="whats-on__lead-date">
                    <DateBlock date={event.start} />
                </div>
            </div>
            <div className="whats-on__lead-body">
                <div className="event-row__tags">
                    <KindTag kind={event.kind} />
                    <StatusBadge status={event.status} />
                </div>
                <h3 className="whats-on__lead-title" lang={lang}>
                    <Link href={eventPath(event.slug)}>{event.title}</Link>
                </h3>
                <EventFacts event={event} />
                {event.description && (
                    <p className="whats-on__lead-text" lang={lang}>
                        {excerpt(event.description, 260)}
                    </p>
                )}
            </div>
        </article>
    );
}
