"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CalendarBody } from "./calendar-body";
import { CalendarProvider } from "./contexts/calendar-context";
import { DndProvider } from "./contexts/dnd-context";
import { CalendarHeader } from "./header/calendar-header";

interface CalendarProps {
    events?: any[];
    className?: string;
    defaultHeight?: string;
}

export function Calendar({ events = [], className = "", defaultHeight = "600px" }: CalendarProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const t = useTranslations('calendar');

    // Handle escape key to exit fullscreen
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when fullscreen
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const calendarContent = (
        <CalendarProvider initialEvents={events} view="month">
            <DndProvider showConfirmation={false}>
                <div className={`w-full border rounded-xl bg-background ${isFullscreen ? 'h-screen rounded-none' : ''}`}>
                    <CalendarHeader
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={toggleFullscreen}
                    />
                    <div className={isFullscreen ? 'h-[calc(100vh-80px)]' : ''} style={{ height: isFullscreen ? undefined : defaultHeight }}>
                        <CalendarBody />
                    </div>
                </div>
            </DndProvider>
        </CalendarProvider>
    );

    return (
        <>
            {/* Regular embedded calendar */}
            {!isFullscreen && (
                <div className={className}>
                    {calendarContent}
                </div>
            )}

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-background"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full w-full"
                        >
                            {calendarContent}

                            {/*/!* Close button for fullscreen *!/*/}
                            {/*<Button*/}
                            {/*    variant="outline"*/}
                            {/*    size="icon"*/}
                            {/*    className="absolute top-4 right-4 z-10"*/}
                            {/*    onClick={toggleFullscreen}*/}
                            {/*    title={t('fullscreen.exit')}*/}
                            {/*>*/}
                            {/*    <X className="h-4 w-4" />*/}
                            {/*</Button>*/}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// // simpler (source code) calendar
// import React from "react";
// import { CalendarBody } from "./calendar-body";
// import { CalendarProvider } from "./contexts/calendar-context";
// import { DndProvider } from "./contexts/dnd-context";
// import { CalendarHeader } from "./header/calendar-header";
//
// interface CalendarProps {
// 	events?: any[];
// }
//
// export function Calendar({ events = [] }: CalendarProps) {
// 	return (
// 		<CalendarProvider initialEvents={events} view="month">
// 			<DndProvider showConfirmation={false}>
// 				<div className="w-full border rounded-xl">
// 					<CalendarHeader />
// 					<CalendarBody />
// 				</div>
// 			</DndProvider>
// 		</CalendarProvider>
// 	);
// }
