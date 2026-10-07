'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, parseISO, isAfter, isSameMonth, startOfDay } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { CalendarProvider, useCalendar } from '@/components/calendar/contexts/calendar-context';
import { EventDetailsDialog } from '@/components/calendar/dialogs/event-details-dialog';
import { getMonthCellEvents, calculateMonthEventPositions, getBulletColor } from '@/components/calendar/helpers';
import { EVENT_COLORS } from '@/components/calendar/types';
import type { IEvent, IUser } from '@/components/calendar/interfaces';
import type { TEventType } from '@/components/calendar/types';

// Transform TinaCMS events to calendar format
function transformTinaCMSEvents(tinaCMSEvents: any[]): IEvent[] {
    return tinaCMSEvents.map((event, index) => ({
        id: event.id || index,
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
    }));
}

interface MiniCalendarWidgetProps {
    events?: any[];
    className?: string;
}

// Internal component that uses calendar context
const MiniCalendarInternal: React.FC<{ className?: string; currentMonth: Date; setCurrentMonth: (date: Date) => void }> = ({
    className,
    currentMonth,
    setCurrentMonth
}) => {
    const locale = useLocale();
    const dateLocale = locale === 'nl' ? nl : enUS;

    // Get events from calendar context
    const { events: contextEvents } = useCalendar();

    // Calculate event positions for proper layout
    const eventPositions = useMemo(() => {
        if (!contextEvents || contextEvents.length === 0) return {};
        const multiDayEvents = contextEvents.filter(event => event.startDate !== event.endDate);
        const singleDayEvents = contextEvents.filter(event => event.startDate === event.endDate);
        return calculateMonthEventPositions(multiDayEvents, singleDayEvents, currentMonth);
    }, [contextEvents, currentMonth]);

    // Calculate calendar grid
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
    };

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
            days.push(format(day, 'EEEEE', { locale: dateLocale })); // Single letter
        }
        return days;
    }, [dateLocale]);

    return (
        <div className={cn("bg-background border rounded-lg p-4", className)}>
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <h3 className="font-semibold text-sm">
                    {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                </h3>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className="text-center text-xs font-medium text-muted-foreground p-1"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    // Get events for this day using calendar helpers
                    const dayEvents = getMonthCellEvents(day, contextEvents, eventPositions);
                    const hasEvent = dayEvents.length > 0;

                    // Get unique event types for color coding
                    const eventTypes = [...new Set(dayEvents.map(event => event.eventType))];
                    const eventColors = eventTypes.map(type => EVENT_COLORS[type as keyof typeof EVENT_COLORS] || 'blue');

                    const dayContent = (
                        <div
                            className={cn(
                                "relative text-center text-xs p-1 h-8 flex items-center justify-center rounded transition-colors w-full",
                                isCurrentMonth
                                    ? "text-foreground hover:bg-accent/50"
                                    : "text-muted-foreground/40",
                                isToday && "bg-primary text-primary-foreground font-semibold",
                                !isToday && hasEvent && isCurrentMonth && "bg-primary/10 text-primary font-medium",
                                hasEvent && isCurrentMonth && "cursor-pointer"
                            )}
                        >
                            <span>{format(day, 'd')}</span>
                            {hasEvent && !isToday && (
                                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                    {eventColors.slice(0, 3).map((color, colorIndex) => (
                                        <div
                                            key={colorIndex}
                                            className={`w-1.5 h-1.5 rounded-full ${getBulletColor(color)}`}
                                        />
                                    ))}
                                    {eventColors.length > 3 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    )}
                                </div>
                            )}
                        </div>
                    );

                    // Wrap in EventDetailsDialog if there are events for this day
                    if (hasEvent && isCurrentMonth) {
                        // Show the first event for this day
                        const firstEvent = dayEvents[0];
                        return (
                            <EventDetailsDialog key={index} event={firstEvent}>
                                {dayContent}
                            </EventDetailsDialog>
                        );
                    }

                    return <div key={index}>{dayContent}</div>;
                })}
            </div>
        </div>
    );
};

// Main component wrapper with CalendarProvider
export const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({
    events = [],
    className
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Transform events to calendar format
    const transformedEvents = useMemo(() => transformTinaCMSEvents(events), [events]);

    return (
        <CalendarProvider initialEvents={transformedEvents} view="month">
            <MiniCalendarInternal
                className={className}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
            />
        </CalendarProvider>
    );
};

// Helper function for adding days (imported from date-fns, but inline for clarity)
function addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}