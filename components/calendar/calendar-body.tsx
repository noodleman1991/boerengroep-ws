"use client";

import { isSameDay, parseISO } from "date-fns";
import { motion } from "framer-motion";
import React from "react";
import { useTranslations } from "next-intl";
import { fadeIn, transition } from "./animations";
import { useCalendar } from "./contexts/calendar-context";
import { AgendaEvents } from "./views/agenda-view/agenda-events";
import { CalendarMonthView } from "./views/month-view/calendar-month-view";

export function CalendarBody() {
    const { view, events, isLoading } = useCalendar();
    const t = useTranslations('calendar');

    // Add error handling for events filtering
    const safeEvents = React.useMemo(() => {
        if (!Array.isArray(events)) {
            console.warn("Events is not an array:", events);
            return [];
        }

        return events.filter(event => {
            // Validate event structure
            if (!event || typeof event !== 'object') return false;
            if (!event.startDate || !event.endDate) return false;

            try {
                // Validate dates
                parseISO(event.startDate);
                parseISO(event.endDate);
                return true;
            } catch (error) {
                console.warn("Invalid event date:", event, error);
                return false;
            }
        });
    }, [events]);

    const singleDayEvents = React.useMemo(() => {
        return safeEvents.filter((event) => {
            try {
                const startDate = parseISO(event.startDate);
                const endDate = parseISO(event.endDate);
                return isSameDay(startDate, endDate);
            } catch (error) {
                console.warn("Error filtering single day events:", error);
                return false;
            }
        });
    }, [safeEvents]);

    const multiDayEvents = React.useMemo(() => {
        return safeEvents.filter((event) => {
            try {
                const startDate = parseISO(event.startDate);
                const endDate = parseISO(event.endDate);
                return !isSameDay(startDate, endDate);
            } catch (error) {
                console.warn("Error filtering multi day events:", error);
                return false;
            }
        });
    }, [safeEvents]);

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">{t('loading')}</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-scroll relative">
            <motion.div
                key={view}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={transition}
            >
                {view === "month" && (
                    <CalendarMonthView
                        singleDayEvents={singleDayEvents}
                        multiDayEvents={multiDayEvents}
                    />
                )}

                {view === "agenda" && (
                    <motion.div
                        key="agenda"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={fadeIn}
                        transition={transition}
                    >
                        <AgendaEvents />
                    </motion.div>
                )}

                {/* Fallback for unsupported views */}
                {!["month", "agenda"].includes(view) && (
                    <div className="flex items-center justify-center h-96">
                        <p className="text-muted-foreground">
                            {view.charAt(0).toUpperCase() + view.slice(1)} view coming soon...
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
