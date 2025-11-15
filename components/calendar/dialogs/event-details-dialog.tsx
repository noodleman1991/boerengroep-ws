"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar, Clock, Text, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
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
            <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full p-4 sm:p-6">
                <DialogHeader className="pb-3 sm:pb-4">
                    <DialogTitle className="text-base sm:text-lg font-semibold pr-8 break-words leading-tight">{event.title}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[65vh] sm:max-h-[60vh] pr-2">
                    <div className="space-y-4 sm:space-y-6 pb-2">
                        {event.image && (
                            <div className="relative w-full -mx-0.5">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    width={400}
                                    height={200}
                                    className="w-full h-40 sm:h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50">
                            <Calendar className="mt-0.5 sm:mt-1 size-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{t('events.startDate')}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 break-words">
                                    {formatDateWithLocale(startDate)}
                                    <span className="mx-1">{t('events.at')}</span>
                                    {formatTime(parseISO(event.startDate), use24HourFormat)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50">
                            <Clock className="mt-0.5 sm:mt-1 size-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{t('events.endDate')}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 break-words">
                                    {formatDateWithLocale(endDate)}
                                    <span className="mx-1">{t('events.at')}</span>
                                    {formatTime(parseISO(event.endDate), use24HourFormat)}
                                </p>
                            </div>
                        </div>

                        {event.description && (
                            <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gray-50">
                                <Text className="mt-0.5 sm:mt-1 size-4 shrink-0 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-900">{t('events.description')}</p>
                                    <div className="text-xs sm:text-sm text-muted-foreground break-words mt-0.5 sm:mt-1 leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </div>
                                </div>
                            </div>
                        )}

                        {event.registrationLink && (
                            <Link
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors min-h-[44px]"
                            >
                                {t('events.register')}
                                <ExternalLink className="size-4" />
                            </Link>
                        )}
                    </div>
                </ScrollArea>
                <DialogClose />
            </DialogContent>
        </Dialog>
    );
}
