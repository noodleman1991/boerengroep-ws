import React from "react";
import { CalendarBody } from "./calendar-body";
import { CalendarProvider } from "./contexts/calendar-context";
import { DndProvider } from "./contexts/dnd-context";
import { CalendarHeader } from "./header/calendar-header";

interface CalendarProps {
	events?: any[];
}

export function Calendar({ events = [] }: CalendarProps) {
	return (
		<CalendarProvider initialEvents={events} view="month">
			<DndProvider showConfirmation={false}>
				<div className="w-full border rounded-xl">
					<CalendarHeader />
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}
