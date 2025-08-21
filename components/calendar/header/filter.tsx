"use client";

import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useCalendar } from "../contexts/calendar-context";
import {EVENT_COLORS, type TEventType} from "../types";
import { getBulletColor } from "../helpers";

export function FilterEvents() {
    const { selectedEventTypes, filterEventsByEventType, clearFilter } = useCalendar();
    const t = useTranslations('calendar');

    const eventTypes: TEventType[] = [
        "talk",
        "workshop",
        "lecture",
        "meeting",
        "board-meeting",
        "soup-kitchen",
        "csa",
        "excursion",
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Toggle variant="outline" className="cursor-pointer w-fit" title={t('filter.title')}>
                    <Filter className="h-4 w-4" />
                    {selectedEventTypes.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {selectedEventTypes.length}
                        </Badge>
                    )}
                </Toggle>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {eventTypes.map((eventType) => {
                    const color = EVENT_COLORS[eventType];
                    const label = t(`eventTypes.${eventType}`);
                    const isSelected = selectedEventTypes.includes(eventType);

                    return (
                        <DropdownMenuItem
                            key={eventType}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                filterEventsByEventType(eventType);
                            }}
                        >
                            <div className={`size-3.5 rounded-full ${getBulletColor(color)}`} />
                            <span className="capitalize flex justify-between items-center w-full">
								{label}
                                {isSelected && (
                                    <CheckIcon className="size-4 text-blue-500" />
                                )}
							</span>
                        </DropdownMenuItem>
                    );
                })}
                <Separator className="my-2" />
                <DropdownMenuItem
                    disabled={selectedEventTypes.length === 0}
                    className="flex gap-2 cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        clearFilter();
                    }}
                >
                    <RefreshCcw className="size-3.5" />
                    {t('filter.clearFilter')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
