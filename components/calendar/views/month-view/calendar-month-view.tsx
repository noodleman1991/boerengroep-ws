import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    staggerContainer,
    transition,
} from "../../animations";
import { useCalendar } from "../../contexts/calendar-context";

import {
    calculateMonthEventPositions,
    getCalendarCells,
} from "../../helpers";

import type { IEvent } from "../../interfaces";
import { DayCell } from "../../views/month-view/day-cell";

interface IProps {
    singleDayEvents: IEvent[];
    multiDayEvents: IEvent[];
}

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
    const { selectedDate } = useCalendar();
    const t = useTranslations('calendar');

    const allEvents = [...multiDayEvents, ...singleDayEvents];

    const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

    const eventPositions = useMemo(
        () =>
            calculateMonthEventPositions(
                multiDayEvents,
                singleDayEvents,
                selectedDate,
            ),
        [multiDayEvents, singleDayEvents, selectedDate],
    );

    // Get translated weekdays
    const weekDays = t.raw('weekdays.short') as string[];

    return (
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
            <div className="grid grid-cols-7">
                {weekDays.map((day, index) => (
                    <motion.div
                        key={day}
                        className="flex items-center justify-center py-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, ...transition }}
                    >
                        <span className="text-xs font-medium text-t-quaternary">{day}</span>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-7 overflow-hidden">
                {cells.map((cell, index) => (
                    <DayCell
                        key={index}
                        cell={cell}
                        events={allEvents}
                        eventPositions={eventPositions}
                    />
                ))}
            </div>
        </motion.div>
    );
}
