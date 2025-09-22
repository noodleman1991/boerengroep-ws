'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO, isAfter } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import type { TinaTemplate } from '@tinacms/cli';
import { tinaField } from 'tinacms/dist/react';
// import { PageBlocksEventsCalendarPreview } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { Calendar, CalendarIcon, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MiniCalendarWidget } from '../ui/mini-calendar-widget';
import { CalendarProvider } from '../calendar/contexts/calendar-context';
import { EventDetailsDialog } from '../calendar/dialogs/event-details-dialog';
import { EVENT_COLORS } from '../calendar/types';
import type { IEvent } from '../calendar/interfaces';
import type { TEventType } from '../calendar/types';
import { motion } from 'motion/react';

interface EventsCalendarPreviewProps {
    data: any; // Will be PageBlocksEventsCalendarPreview once types are regenerated
    events?: any[];
    globalData?: any;
}

// Transform TinaCMS events to calendar format for dialogs
function transformEventForDialog(event: any): IEvent {
    return {
        id: event.id || 0,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'meeting',
        color: EVENT_COLORS[event.eventType as TEventType] || 'blue',
        user: {
            id: event.speakers?.[0]?.speaker?.id || 'system',
            name: event.speakers?.[0]?.speaker?.name || 'System',
            picturePath: event.speakers?.[0]?.speaker?.avatar || null,
        },
        image: event.image,
    };
}

export const EventsCalendarPreview = ({ data, events = [], globalData }: EventsCalendarPreviewProps) => {
    const t = useTranslations('events');
    const locale = useLocale();
    const dateLocale = locale === 'nl' ? nl : enUS;

    // Get events for display - show upcoming events, fill with past events if needed
    const getEventsForDisplay = (events: any[] = []) => {
        const now = new Date();

        // Get upcoming events
        const upcomingEvents = events
            .filter(event => event?.startDate && isAfter(parseISO(event.startDate), now))
            .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

        // Get past events
        const pastEvents = events
            .filter(event => event?.startDate && !isAfter(parseISO(event.startDate), now))
            .sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());

        // Logic: if 3 upcoming → show 3 upcoming, if 2 upcoming → show 2 upcoming,
        // if 1 upcoming → show 1 upcoming + 2 past, if 0 upcoming → show 3 most recent past
        if (upcomingEvents.length >= 3) {
            return upcomingEvents.slice(0, 3);
        } else if (upcomingEvents.length === 2) {
            return upcomingEvents;
        } else if (upcomingEvents.length === 1) {
            return [...upcomingEvents, ...pastEvents.slice(0, 2)];
        } else {
            return pastEvents.slice(0, 3);
        }
    };

    const displayEvents = getEventsForDisplay(events);

    // Check if calendar widget should be shown
    const showCalendarWidget = globalData?.homepage?.showCalendarWidget !== false; // Default to true

    const formatEventDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'dd MMM yyyy', { locale: dateLocale });
        } catch {
            return dateString;
        }
    };

    const formatEventTime = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'HH:mm', { locale: dateLocale });
        } catch {
            return '';
        }
    };

    return (
        <CalendarProvider initialEvents={[]} view="month">
            <Section background={data.background!}>
                <div className="container mx-auto px-4">
                    <div className={`grid gap-8 md:gap-12 ${showCalendarWidget ? 'md:grid-cols-3' : 'md:grid-cols-1'} items-start justify-center`}>
                        {/* Left Column - Upcoming Events (takes 2 columns when calendar is shown) */}
                        <motion.div
                            className={`space-y-6 flex flex-col items-center md:items-start ${showCalendarWidget ? 'md:col-span-2' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <motion.div
                                className="text-center md:text-left w-full"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <h2 className="text-2xl font-heading font-bold mb-4" data-tina-field={tinaField(data, 'title')}>
                                    {data.title || t('upcomingEvents')}
                                </h2>
                            </motion.div>

                            <div className="space-y-4 w-full">
                                {displayEvents.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-6">
                                            <p className="text-muted-foreground text-center">
                                                {t('noEvents')}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    displayEvents.map((event, index) => {
                                        const transformedEvent = transformEventForDialog(event);
                                        return (
                                            <motion.div
                                                key={`${event?.id || index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.5,
                                                    ease: "easeOut",
                                                    delay: 0.2 + (index * 0.1)
                                                }}
                                                viewport={{ once: true, margin: "-100px" }}
                                            >
                                                <EventDetailsDialog event={transformedEvent}>
                                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-shrink-0">
                                                                {event?.image ? (
                                                                    <Image
                                                                        src={event.image}
                                                                        alt={event?.title || 'Event image'}
                                                                        width={50}
                                                                        height={50}
                                                                        className="rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="bg-primary/10 rounded-lg p-3">
                                                                        <CalendarIcon className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
                                                                    {event?.title}
                                                                </h3>
                                                                {event?.description && (
                                                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                                                        {event.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span>
                                                                            {formatEventDate(event?.startDate)} {formatEventTime(event?.startDate)}
                                                                        </span>
                                                                    </div>
                                                                    {event?.location?.address && (
                                                                        <div className="flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            <span className="truncate max-w-[120px]">
                                                                                {event.location.address}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {event?.eventType && (
                                                                        <span className="bg-secondary px-2 py-1 rounded text-xs">
                                                                            {event.eventType}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </EventDetailsDialog>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>

                        </motion.div>

                    {/* Right Column - Mini Calendar */}
                    {showCalendarWidget && (
                        <motion.div
                            className="space-y-6 flex flex-col items-center md:items-start"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <MiniCalendarWidget
                                    events={events}
                                    className="w-full max-w-sm mx-auto md:mx-0"
                                />
                            </motion.div>
                            <motion.div
                                className="flex justify-center md:justify-start"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/${locale}/activities/calendar`}>
                                        {t('viewFullCalendar')}
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </Section>
        </CalendarProvider>
    );
};

export const eventsCalendarPreviewBlockSchema: TinaTemplate = {
    name: 'eventsCalendarPreview',
    label: 'Events & Calendar Preview',
    ui: {
        previewSrc: '/blocks/calendar.png',
        defaultItem: {
            background: 'bg-background',
            title: '',
            description: '',
        },
    },
    fields: [
        sectionBlockSchemaField as any,
        {
            type: 'string',
            label: 'Section Title',
            name: 'title',
            description: 'Optional custom title (defaults to translation key)',
        },
        {
            type: 'string',
            label: 'Section Description',
            name: 'description',
            ui: {
                component: 'textarea',
            },
            description: 'Optional custom description (defaults to translation key)',
        },
    ],
};