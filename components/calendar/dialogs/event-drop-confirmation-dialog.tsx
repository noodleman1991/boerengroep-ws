"use client";

import {format} from "date-fns";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {IEvent} from "../interfaces";
import {formatTime, getColorClass} from "../helpers";
import {cn} from "@/lib/utils";
import {useCalendar} from "../contexts/calendar-context";

interface EventDropConfirmationDialogProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    event: IEvent | null;
    newStartDate: Date | null;
    newEndDate: Date | null;
    onConfirmAction: () => void;
    onCancelAction: () => void;
}

export function EventDropConfirmationDialog({
                                                open,
                                                onOpenChangeAction,
                                                event,
                                                newStartDate,
                                                newEndDate,
                                                onConfirmAction,
                                                onCancelAction,
                                            }: EventDropConfirmationDialogProps) {

    const {use24HourFormat} = useCalendar();

    if (!event || !newStartDate || !newEndDate) {
        return null;
    }

    const originalStart = new Date(event.startDate);

    const formatDate = (date: Date) => {
        return format(date, "MMM dd, yyyy 'at '") + formatTime(date, use24HourFormat);
    };

    const handleConfirm = () => {
        onConfirmAction();
        onOpenChangeAction(false);
    };

    const handleCancel = () => {
        onCancelAction();
        onOpenChangeAction(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChangeAction}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Event Move</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to move
                        <span className={cn(getColorClass(event.color), "mx-1 py-0.5 px-1 rounded-md")}>
							{event.title}
						</span>
                        event from
                        <strong className="mx-1">{formatDate(originalStart)}</strong> to
                        <strong className="mx-1">{formatDate(newStartDate)}</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        Move Event
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
