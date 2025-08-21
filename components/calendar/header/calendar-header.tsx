"use client";

import { motion } from "framer-motion";
import {
    CalendarRange,
    Grid3X3,
    LayoutList,
    Maximize,
    Minimize,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    slideFromLeft,
    slideFromRight,
    transition,
} from "../animations";
import { useCalendar } from "../contexts/calendar-context";
import { DateNavigator } from "../header/date-navigator";
import { FilterEvents } from "../header/filter";
import { TodayButton } from "../header/today-button";
import { Settings } from "../settings/settings";

interface CalendarHeaderProps {
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

export function CalendarHeader({ isFullscreen = false, onToggleFullscreen }: CalendarHeaderProps) {
    const { view, setView, events } = useCalendar();
    const [isHydrated, setIsHydrated] = useState(false);
    const t = useTranslations('calendar');

    // Prevent hydration mismatch by only rendering after client hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        // Render a simplified version during SSR
        return (
            <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded border" /> {/* TodayButton placeholder */}
                    <div className="h-8 w-32 rounded border" /> {/* DateNavigator placeholder */}
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5">
                    <div className="flex h-10 w-40 rounded border" /> {/* ButtonGroup placeholder */}
                    <div className="h-10 w-10 rounded border" /> {/* Settings placeholder */}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <motion.div
                className="flex items-center gap-3"
                variants={slideFromLeft}
                initial="initial"
                animate="animate"
                transition={transition}
            >
                <TodayButton />
                <DateNavigator view={view} events={events} />
            </motion.div>

            <motion.div
                className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
                variants={slideFromRight}
                initial="initial"
                animate="animate"
                transition={transition}
            >
                <div className="options flex-wrap flex items-center gap-4 md:gap-2">
                    <FilterEvents />

                    <ButtonGroup className="flex">
                        <Button
                            variant={view === "agenda" ? "default" : "outline"}
                            onClick={() => setView("agenda")}
                            className="rounded-e-none"
                            title={t('views.agenda')}
                        >
                            {view === "agenda" ? (
                                <CalendarRange className="h-4 w-4" />
                            ) : (
                                <LayoutList className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            variant={view === "month" ? "default" : "outline"}
                            aria-label={t('views.month')}
                            onClick={() => setView("month")}
                            title={t('views.month')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                    </ButtonGroup>

                    {onToggleFullscreen && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onToggleFullscreen}
                            title={isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>

                <Settings />
            </motion.div>
        </div>
    );
}
