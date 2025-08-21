import { formatDate } from "date-fns";
import { nl } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    buttonHover,
    transition,
} from "../animations";
import { useCalendar } from "../contexts/calendar-context";

import {
    getEventsCount,
    navigateDate,
    rangeText,
} from "../helpers";

import type { IEvent } from "../interfaces";
import type { TCalendarView } from "../types";

interface IProps {
    view: TCalendarView;
    events: IEvent[];
}

const MotionButton = motion.create(Button);
const MotionBadge = motion.create(Badge);

export function DateNavigator({ view, events }: IProps) {
    const { selectedDate, setSelectedDate } = useCalendar();
    const t = useTranslations('calendar');
    const locale = useLocale();

    const month = formatDate(selectedDate, "MMMM", {
        locale: locale === 'nl' ? nl : undefined
    });
    const year = selectedDate.getFullYear();

    const eventCount = useMemo(
        () => getEventsCount(events, selectedDate, view),
        [events, selectedDate, view],
    );

    const handlePrevious = () =>
        setSelectedDate(navigateDate(selectedDate, view, "previous"));
    const handleNext = () =>
        setSelectedDate(navigateDate(selectedDate, view, "next"));

    const eventCountText = useMemo(() => {
        if (eventCount === 1) {
            return `1 ${t('navigation.event')}`;
        }
        return `${eventCount} ${t('navigation.events')}`;
    }, [eventCount, t]);

    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-2">
                <motion.span
                    className="text-lg font-semibold"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={transition}
                >
                    {month} {year}
                </motion.span>
                <AnimatePresence mode="wait">
                    <MotionBadge
                        key={eventCount}
                        variant="secondary"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={transition}
                    >
                        {eventCountText}
                    </MotionBadge>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
                <MotionButton
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handlePrevious}
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                    title={t('navigation.previous')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </MotionButton>

                <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={transition}
                >
                    {rangeText(view, selectedDate, locale)}
                </motion.p>

                <MotionButton
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleNext}
                    variants={buttonHover}
                    whileHover="hover"
                    whileTap="tap"
                    title={t('navigation.next')}
                >
                    <ChevronRight className="h-4 w-4" />
                </MotionButton>
            </div>
        </div>
    );
}
