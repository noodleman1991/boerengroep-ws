import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { eventPath } from '@/lib/events/ics-site';
import type { SiteEvent } from '@/lib/events/types';
import { DateBlock, EventFacts, StatusBadge, TypeTag, useEventLang } from './event-bits';

/**
 * One event in a list: the date large on the left, what and where in the middle, the picture
 * on the right. The whole row leads to the event's page.
 */
export function EventRow({ event, headingLevel: Heading = 'h3', compact = false }: {
    event: SiteEvent;
    headingLevel?: 'h2' | 'h3' | 'h4';
    /** Without the description and with a smaller date, for tight places. */
    compact?: boolean;
}) {
    const off = event.status === 'cancelled' || event.status === 'postponed';
    const lang = useEventLang(event);
    return (
        <article className={`event-row${compact ? ' event-row--compact' : ''}${off ? ' event-row--off' : ''}`}>
            <DateBlock date={event.start} />
            <div className="event-row__body">
                <div className="event-row__tags">
                    <TypeTag type={event.type} />
                    <StatusBadge status={event.status} />
                </div>
                <Heading className="event-row__title" lang={lang}>
                    <Link href={eventPath(event.slug)}>{event.title}</Link>
                </Heading>
                <EventFacts event={event} />
                {!compact && event.description && (
                    <p className="event-row__text" lang={lang}>
                        {event.description}
                    </p>
                )}
            </div>
            {event.image?.thumbnail && (
                <Image
                    className="event-row__picture"
                    src={event.image.thumbnail}
                    alt=""
                    width={400}
                    height={300}
                    sizes="(max-width: 640px) 96px, 176px"
                />
            )}
        </article>
    );
}
