"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar, Clock, Text } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "../contexts/calendar-context";
import { formatTime } from "../helpers";
import type { IEvent } from "../interfaces";

interface IProps {
    event: IEvent;
    children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    const { use24HourFormat } = useCalendar();
    const t = useTranslations('calendar');
    const locale = useLocale();

    const formatDateWithLocale = (date: Date) => {
        return format(date, "EEEE dd MMMM", {
            locale: locale === 'nl' ? nl : undefined
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md p-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-lg font-semibold pr-8">{event.title}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-2">
                    <div className="space-y-6 pb-2">
                        {event.image && (
                            <div className="relative w-full">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    width={400}
                                    height={200}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{t('events.startDate')}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formatDateWithLocale(startDate)}
                                    <span className="mx-1">{t('events.at')}</span>
                                    {formatTime(parseISO(event.startDate), use24HourFormat)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{t('events.endDate')}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formatDateWithLocale(endDate)}
                                    <span className="mx-1">{t('events.at')}</span>
                                    {formatTime(parseISO(event.endDate), use24HourFormat)}
                                </p>
                            </div>
                        </div>

                        {event.description && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{t('events.description')}</p>
                                    <div className="text-sm text-muted-foreground break-words mt-1 leading-relaxed">
                                        {event.description}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DialogClose />
            </DialogContent>
        </Dialog>
    );
}
