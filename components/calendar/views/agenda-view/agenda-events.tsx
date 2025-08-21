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
        <Command className="py-4 h-[80vh] bg-transparent">
            <div className="mb-4 mx-4">
                <CommandInput placeholder={t('search.placeholder')} />
            </div>
            <CommandList className="max-h-max px-3 border-t">
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
                        >
                            {groupedEvents.map((event: IEvent) => (
                                <CommandItem
                                    key={event.id}
                                    className={cn(
                                        "mb-2 p-4 border rounded-md data-[selected=true]:bg-bg transition-all data-[selected=true]:text-none hover:cursor-pointer",
                                        {
                                            [getColorClass(event.color)]: badgeVariant === "colored",
                                            "hover:bg-zinc-200 dark:hover:bg-gray-900":
                                                badgeVariant === "dot",
                                            "hover:opacity-60": badgeVariant === "colored",
                                        },
                                    )}
                                >
                                    <EventDetailsDialog event={event}>
                                        <div className="w-full flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                {badgeVariant === "dot" ? (
                                                    <EventBullet color={event.color} />
                                                ) : (
                                                    <Avatar>
                                                        <AvatarImage src="" alt="@event" />
                                                        <AvatarFallback className={getBgColor(event.color)}>
                                                            {getFirstLetters(event.title)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p
                                                        className={cn({
                                                            "font-medium": badgeVariant === "dot",
                                                            "text-foreground": badgeVariant === "dot",
                                                        })}
                                                    >
                                                        {event.title}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm line-clamp-1 text-ellipsis md:text-clip w-1/3">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-40 flex justify-center items-center gap-1">
                                                <p className="text-sm">
                                                    {formatTime(event.startDate, use24HourFormat)}
                                                </p>
                                                <span className="text-muted-foreground">-</span>
                                                <p className="text-sm">
                                                    {formatTime(event.endDate, use24HourFormat)}
                                                </p>
                                            </div>
                                        </div>
                                    </EventDetailsDialog>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    );
                })}
                <CommandEmpty>{t('search.noResults')}</CommandEmpty>
            </CommandList>
        </Command>
    );
};
