import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInDays,
    differenceInMinutes,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    isSameDay,
    isSameMonth,
    isSameWeek,
    isSameYear,
    isValid,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from "date-fns";
import { nl } from "date-fns/locale";
import { useCalendar } from "../calendar/contexts/calendar-context";
import type {
    ICalendarCell,
    IEvent,
} from "../calendar/interfaces";
import type {
    TCalendarView,
    TEventColor,
} from "../calendar/types";

const FORMAT_STRING = "MMM d, yyyy";

export function rangeText(view: TCalendarView, date: Date, locale?: string): string {
    let start: Date;
    let end: Date;

    // Get locale for date-fns - FIXED: proper import instead of require()
    const dateLocale = locale === 'nl' ? nl : undefined;

    switch (view) {
        case "month":
            start = startOfMonth(date);
            end = endOfMonth(date);
            break;
        case "week":
            start = startOfWeek(date);
            end = endOfWeek(date);
            break;
        case "day":
            return format(date, FORMAT_STRING, { locale: dateLocale });
        case "year":
            start = startOfYear(date);
            end = endOfYear(date);
            break;
        case "agenda":
            start = startOfMonth(date);
            end = endOfMonth(date);
            break;
        default:
            return "Error while formatting";
    }

    return `${format(start, FORMAT_STRING, { locale: dateLocale })} - ${format(end, FORMAT_STRING, { locale: dateLocale })}`;
}

export function navigateDate(
    date: Date,
    view: TCalendarView,
    direction: "previous" | "next",
): Date {
    const operations: Record<TCalendarView, (d: Date, n: number) => Date> = {
        month: direction === "next" ? addMonths : subMonths,
        week: direction === "next" ? addWeeks : subWeeks,
        day: direction === "next" ? addDays : subDays,
        year: direction === "next" ? addYears : subYears,
        agenda: direction === "next" ? addMonths : subMonths,
    };

    return operations[view](date, 1);
}

export function getEventsCount(
    events: IEvent[],
    date: Date,
    view: TCalendarView,
): number {
    const compareFns: Record<TCalendarView, (d1: Date, d2: Date) => boolean> = {
        day: isSameDay,
        week: isSameWeek,
        month: isSameMonth,
        year: isSameYear,
        agenda: isSameMonth,
    };

    const compareFn = compareFns[view];
    return events.filter((event) => compareFn(parseISO(event.startDate), date))
        .length;
}

export function groupEvents(dayEvents: IEvent[]): IEvent[][] {
    const sortedEvents = dayEvents.sort(
        (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    );
    const groups: IEvent[][] = [];

    for (const event of sortedEvents) {
        const eventStart = parseISO(event.startDate);
        let placed = false;

        for (const group of groups) {
            const lastEventInGroup = group[group.length - 1];
            const lastEventEnd = parseISO(lastEventInGroup.endDate);

            if (eventStart >= lastEventEnd) {
                group.push(event);
                placed = true;
                break;
            }
        }

        if (!placed) groups.push([event]);
    }

    return groups;
}

export function getEventBlockStyle(
    event: IEvent,
    day: Date,
    groupIndex: number,
    groupSize: number,
) {
    const startDate = parseISO(event.startDate);
    const dayStart = startOfDay(day); // Use startOfDay instead of manual reset
    const eventStart = startDate < dayStart ? dayStart : startDate;
    const startMinutes = differenceInMinutes(eventStart, dayStart);

    const top = (startMinutes / 1440) * 100; // 1440 minutes in a day
    const width = 100 / groupSize;
    const left = groupIndex * width;

    return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const daysInMonth = endOfMonth(selectedDate).getDate(); // Faster than new Date(year, month + 1, 0)
    const firstDayOfMonth = startOfMonth(selectedDate).getDay();
    const daysInPrevMonth = endOfMonth(new Date(year, month - 1)).getDate();
    const totalDays = firstDayOfMonth + daysInMonth;

    const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
        day: daysInPrevMonth - firstDayOfMonth + i + 1,
        currentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
    }));

    const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        currentMonth: true,
        date: new Date(year, month, i + 1),
    }));

    const nextMonthCells = Array.from(
        { length: (7 - (totalDays % 7)) % 7 },
        (_, i) => ({
            day: i + 1,
            currentMonth: false,
            date: new Date(year, month + 1, i + 1),
        }),
    );

    return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(
    multiDayEvents: IEvent[],
    singleDayEvents: IEvent[],
    selectedDate: Date,
): Record<string, number> {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const eventPositions: Record<string, number> = {};
    const occupiedPositions: Record<string, boolean[]> = {};

    eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
        occupiedPositions[day.toISOString()] = [false, false, false];
    });

    const sortedEvents = [
        ...multiDayEvents.sort((a, b) => {
            const aDuration = differenceInDays(
                parseISO(a.endDate),
                parseISO(a.startDate),
            );
            const bDuration = differenceInDays(
                parseISO(b.endDate),
                parseISO(b.startDate),
            );
            return (
                bDuration - aDuration ||
                parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
            );
        }),
        ...singleDayEvents.sort(
            (a, b) =>
                parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
        ),
    ];

    sortedEvents.forEach((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        const eventDays = eachDayOfInterval({
            start: eventStart < monthStart ? monthStart : eventStart,
            end: eventEnd > monthEnd ? monthEnd : eventEnd,
        });

        let position = -1;

        for (let i = 0; i < 3; i++) {
            if (
                eventDays.every((day) => {
                    const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
                    return dayPositions && !dayPositions[i];
                })
            ) {
                position = i;
                break;
            }
        }

        if (position !== -1) {
            eventDays.forEach((day) => {
                const dayKey = startOfDay(day).toISOString();
                occupiedPositions[dayKey][position] = true;
            });
            eventPositions[event.id] = position;
        }
    });

    return eventPositions;
}

export function getMonthCellEvents(
    date: Date,
    events: IEvent[],
    eventPositions: Record<string, number>,
) {
    const dayStart = startOfDay(date);
    const eventsForDate = events.filter((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
            (dayStart >= eventStart && dayStart <= eventEnd) ||
            isSameDay(dayStart, eventStart) ||
            isSameDay(dayStart, eventEnd)
        );
    });

    return eventsForDate
        .map((event) => ({
            ...event,
            position: eventPositions[event.id] ?? -1,
            isMultiDay: event.startDate !== event.endDate,
        }))
        .sort((a, b) => {
            if (a.isMultiDay && !b.isMultiDay) return -1;
            if (!a.isMultiDay && b.isMultiDay) return 1;
            return a.position - b.position;
        });
}

export function formatTime(
    date: Date | string,
    use24HourFormat: boolean,
): string {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsedDate)) return "";
    return format(parsedDate, use24HourFormat ? "HH:mm" : "h:mm a");
}

export const getFirstLetters = (str: string): string => {
    if (!str) return "";
    const words = str.split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return `${words[0].charAt(0).toUpperCase()}${words[1].charAt(0).toUpperCase()}`;
};

export const getEventsForDay = (
    events: IEvent[],
    date: Date,
    isWeek = false,
): IEvent[] => {
    const targetDate = startOfDay(date);
    return events
        .filter((event) => {
            const startOfDayForEventStart = startOfDay(parseISO(event.startDate));
            const startOfDayForEventEnd = startOfDay(parseISO(event.endDate));
            if (isWeek) {
                return (
                    event.startDate !== event.endDate &&
                    startOfDayForEventStart <= targetDate &&
                    startOfDayForEventEnd >= targetDate
                );
            }
            return (
                startOfDayForEventStart <= targetDate &&
                startOfDayForEventEnd >= targetDate
            );
        })
        .map((event) => {
            const eventStart = startOfDay(parseISO(event.startDate));
            const eventEnd = startOfDay(parseISO(event.endDate));
            let point: "start" | "end" | "none" | undefined;

            if (isSameDay(eventStart, eventEnd)) {
                point = "none";
            } else if (isSameDay(eventStart, targetDate)) {
                point = "start";
            } else if (isSameDay(eventEnd, targetDate)) {
                point = "end";
            }

            return { ...event, point };
        });
};

export const getWeekDates = (date: Date): Date[] => {
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

export const getEventsForWeek = (events: IEvent[], date: Date): IEvent[] => {
    const weekDates = getWeekDates(date);
    const startOfWeekDate = weekDates[0];
    const endOfWeekDate = weekDates[6];

    return events.filter((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
            isValid(eventStart) &&
            isValid(eventEnd) &&
            eventStart <= endOfWeekDate &&
            eventEnd >= startOfWeekDate
        );
    });
};

export const getEventsForMonth = (events: IEvent[], date: Date): IEvent[] => {
    const startOfMonthDate = startOfMonth(date);
    const endOfMonthDate = endOfMonth(date);

    return events.filter((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
            isValid(eventStart) &&
            isValid(eventEnd) &&
            eventStart <= endOfMonthDate &&
            eventEnd >= startOfMonthDate
        );
    });
};

export const getEventsForYear = (events: IEvent[], date: Date): IEvent[] => {
    if (!events || !Array.isArray(events) || !isValid(date)) return [];

    const startOfYearDate = startOfYear(date);
    const endOfYearDate = endOfYear(date);

    return events.filter((event) => {
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);
        return (
            isValid(eventStart) &&
            isValid(eventEnd) &&
            eventStart <= endOfYearDate &&
            eventEnd >= startOfYearDate
        );
    });
};

// BRAND COLOR CLASSES - USING CSS CUSTOM PROPERTIES
export const getColorClass = (color: TEventColor): string => {
    const colorClasses: Record<TEventColor, string> = {
        red: "border-red-500 bg-red-100 text-red-800 dark:border-red-400 dark:bg-red-900 dark:text-red-100",
        yellow: "border-yellow-500 bg-yellow-100 text-yellow-800 dark:border-yellow-400 dark:bg-yellow-900 dark:text-yellow-100",
        green: "border-[var(--color-brand-green)] bg-green-50 text-green-900 dark:border-green-400 dark:bg-green-900 dark:text-green-100",
        blue: "border-[var(--color-brand-blue)] bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-100",
        orange: "border-[var(--color-brand-orange)] bg-orange-50 text-orange-900 dark:border-orange-400 dark:bg-orange-900 dark:text-orange-100",
        lime: "border-[var(--color-brand-lime)] bg-lime-50 text-lime-900 dark:border-lime-400 dark:bg-lime-900 dark:text-lime-100",
        tan: "border-[var(--color-brand-tan)] bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-900 dark:text-amber-100",
        navy: "border-[var(--color-brand-navy)] bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-100",
        purple: "border-purple-500 bg-purple-50 text-purple-800 dark:border-purple-400 dark:bg-purple-900 dark:text-purple-100",
        pink: "border-pink-500 bg-pink-50 text-pink-800 dark:border-pink-400 dark:bg-pink-900 dark:text-pink-100",
        teal: "border-teal-500 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-900 dark:text-teal-100",
    };
    return colorClasses[color] || colorClasses.green;
};

export const getBgColor = (color: TEventColor): string => {
    const colorClasses: Record<TEventColor, string> = {
        red: "bg-red-500 dark:bg-red-600 text-white",
        yellow: "bg-yellow-500 dark:bg-yellow-600 text-white",
        green: "bg-[var(--color-brand-green)] text-white",
        blue: "bg-[var(--color-brand-blue)] text-white",
        orange: "bg-[var(--color-brand-orange)] text-white",
        lime: "bg-[var(--color-brand-lime)] text-white",
        tan: "bg-[var(--color-brand-tan)] text-white",
        navy: "bg-[var(--color-brand-navy)] text-white",
        purple: "bg-purple-500 dark:bg-purple-600 text-white",
        pink: "bg-pink-500 dark:bg-pink-600 text-white",
        teal: "bg-teal-500 dark:bg-teal-600 text-white",
    };
    return colorClasses[color] || colorClasses.green;
};

export const getBulletColor = (color: TEventColor): string => {
    const colorClasses: Record<TEventColor, string> = {
        red: "bg-red-500 dark:bg-red-400",
        yellow: "bg-yellow-500 dark:bg-yellow-400",
        green: "bg-[var(--color-brand-green)]",
        blue: "bg-[var(--color-brand-blue)]",
        orange: "bg-[var(--color-brand-orange)]",
        lime: "bg-[var(--color-brand-lime)]",
        tan: "bg-[var(--color-brand-tan)]",
        navy: "bg-[var(--color-brand-navy)]",
        purple: "bg-purple-500 dark:bg-purple-400",
        pink: "bg-pink-500 dark:bg-pink-400",
        teal: "bg-teal-500 dark:bg-teal-400",
    };
    return colorClasses[color] || colorClasses.green;
};

export const useGetEventsByMode = (events: IEvent[]) => {
    const { view, selectedDate } = useCalendar();

    switch (view) {
        case "day":
            return getEventsForDay(events, selectedDate);
        case "week":
            return getEventsForWeek(events, selectedDate);
        case "agenda":
        case "month":
            return getEventsForMonth(events, selectedDate);
        case "year":
            return getEventsForYear(events, selectedDate);
        default:
            return [];
    }
};

export const toCapitalize = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};
