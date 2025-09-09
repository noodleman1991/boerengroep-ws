import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { groupBy } from "lodash";
import type { FC } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCalendar } from "../../contexts/calendar-context";
import { EventDetailsDialog } from "../../dialogs/event-details-dialog";
import {
    formatTime,
    getBgColor,
    getColorClass,
    getEventsForMonth,
    getFirstLetters,
} from "../../helpers";
import { EventBullet } from "../../views/month-view/event-bullet";
import type { IEvent } from "../../interfaces";

export const AgendaEvents: FC = () => {
    const { events, badgeVariant, use24HourFormat, selectedDate } = useCalendar();
    const t = useTranslations('calendar');
    const locale = useLocale();

    const monthEvents = getEventsForMonth(events, selectedDate);

    // Use lodash groupBy with proper typing - always group by date for now
    const agendaEvents: Record<string, IEvent[]> = groupBy(
        monthEvents,
        (event: IEvent) => format(parseISO(event.startDate), "yyyy-MM-dd")
    );

    const groupedAndSortedEvents: [string, IEvent[]][] = Object.entries(agendaEvents).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (groupedAndSortedEvents.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-muted-foreground">{t('events.noEvents')}</p>
            </div>
        );
    }

    return (
        <div className="py-4 h-[80vh] bg-transparent">
            <Command className="bg-transparent">
                <div className="mx-4 mb-6">
                    <CommandInput 
                        placeholder={locale === 'nl' ? 'Zoek gebeurtenissen...' : 'Search events...'} 
                        className="h-10 border-gray-200 bg-white shadow-sm rounded-lg [&_div]:border-0 [&_svg]:hidden" 
                    />
                </div>
                <CommandList className="max-h-max px-0">
                {groupedAndSortedEvents.map(([key, groupedEvents]) => {
                    if (!groupedEvents || groupedEvents.length === 0) return null;

                    const dateObj = parseISO(key);
                    const formattedDate = format(dateObj, "EEEE, MMMM d, yyyy", {
                        locale: locale === 'nl' ? nl : undefined
                    });

                    return (
                        <CommandGroup
                            key={key}
                            heading={formattedDate}
                            className="mb-8"
                        >
                            <div className="space-y-4">
                                {groupedEvents.map((event: IEvent) => (
                                    <CommandItem
                                        key={event.id}
                                        className={cn(
                                            "p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md data-[selected=true]:bg-gray-50 transition-all data-[selected=true]:text-none hover:cursor-pointer hover:border-gray-300",
                                            {
                                                [getColorClass(event.color)]: badgeVariant === "colored",
                                                "hover:bg-gray-50 dark:hover:bg-gray-800":
                                                    badgeVariant === "dot",
                                                "hover:opacity-90": badgeVariant === "colored",
                                            },
                                        )}
                                    >
                                    <EventDetailsDialog event={event}>
                                        <div className="w-full flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                {badgeVariant === "dot" ? (
                                                    <EventBullet color={event.color} />
                                                ) : (
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src="" alt="@event" />
                                                        <AvatarFallback className={getBgColor(event.color)}>
                                                            {getFirstLetters(event.title)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <p
                                                        className={cn("font-semibold text-gray-900 truncate", {
                                                            "font-medium": badgeVariant === "dot",
                                                            "text-foreground": badgeVariant === "dot",
                                                        })}
                                                    >
                                                        {event.title}
                                                    </p>
                                                    {event.description && (
                                                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                    {formatTime(event.startDate, use24HourFormat)}
                                                    <span className="text-gray-400">-</span>
                                                    {formatTime(event.endDate, use24HourFormat)}
                                                </div>
                                            </div>
                                        </div>
                                    </EventDetailsDialog>
                                    </CommandItem>
                                ))}
                            </div>
                        </CommandGroup>
                    );
                    })}
                    <CommandEmpty>{t('search.noResults')}</CommandEmpty>
                </CommandList>
            </Command>
        </div>
    );
};
