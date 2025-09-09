import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "../../contexts/calendar-context";
import { EventDetailsDialog } from "../../dialogs/event-details-dialog";
import { DraggableEvent } from "../../dnd/draggable-event";
import { formatTime } from "../../helpers";
import type { IEvent } from "../../interfaces";
import {EventBullet} from "../../views/month-view/event-bullet";

const eventBadgeVariants = cva(
	"mx-1 flex size-auto h-7 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs font-medium",
	{
		variants: {
			color: {
				// Brand color variants using vibrant colors with CSS custom properties
				blue: "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)]/15 text-blue-900 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-100",
				green: "border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/15 text-green-900 dark:border-green-400 dark:bg-green-900 dark:text-green-100",
				orange: "border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/15 text-orange-900 dark:border-orange-400 dark:bg-orange-900 dark:text-orange-100",
				lime: "border-[var(--color-brand-lime)] bg-[var(--color-brand-lime)]/15 text-green-900 dark:border-lime-400 dark:bg-lime-900 dark:text-lime-100",
				tan: "border-[var(--color-brand-tan)] bg-[var(--color-brand-tan)]/15 text-amber-900 dark:border-amber-400 dark:bg-amber-900 dark:text-amber-100",
				navy: "border-[var(--color-brand-navy)] bg-[var(--color-brand-navy)]/15 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-100",
				red: "border-red-500 bg-red-500/15 text-red-900 dark:border-red-400 dark:bg-red-900 dark:text-red-100",
				purple: "border-purple-500 bg-purple-500/15 text-purple-900 dark:border-purple-400 dark:bg-purple-900 dark:text-purple-100",

				// Dot variants using brand colors
				"blue-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-blue)]",
				"green-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-green)]",
				"orange-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-orange)]",
				"lime-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-lime)]",
				"tan-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-tan)]",
				"navy-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-[var(--color-brand-navy)]",
				"red-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-red-500",
				"purple-dot": "bg-white border-gray-200 text-gray-800 [&_svg]:fill-purple-500",
			},
			multiDayPosition: {
				first:
					"relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5",
				middle:
					"relative z-10 mx-0 w-[calc(100%_+_2px)] rounded-none border-x-0 -ml-px -mr-px",
				last: "ml-0 rounded-l-none border-l-0 -ml-px",
				none: "",
			},
		},
		defaultVariants: {
			color: "blue-dot",
		},
	},
);

interface IProps
	extends Omit<
		VariantProps<typeof eventBadgeVariants>,
		"color" | "multiDayPosition"
	> {
	event: IEvent;
	cellDate: Date;
	eventCurrentDay?: number;
	eventTotalDays?: number;
	className?: string;
	position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
	event,
	cellDate,
	eventCurrentDay,
	eventTotalDays,
	className,
	position: propPosition,
}: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const itemStart = startOfDay(parseISO(event.startDate));
	const itemEnd = endOfDay(parseISO(event.endDate));

	if (cellDate < itemStart || cellDate > itemEnd) return null;

	let position: "first" | "middle" | "last" | "none" | undefined;

	if (propPosition) {
		position = propPosition;
	} else if (eventCurrentDay && eventTotalDays) {
		position = "none";
	} else if (isSameDay(itemStart, itemEnd)) {
		position = "none";
	} else if (isSameDay(cellDate, itemStart)) {
		position = "first";
	} else if (isSameDay(cellDate, itemEnd)) {
		position = "last";
	} else {
		position = "middle";
	}

	const renderBadgeText = ["first", "none"].includes(position) ;
	const renderBadgeTime =  ["last", "none"].includes(position);

	const color = (
		badgeVariant === "dot" ? `${event.color}-dot` : event.color
	) as VariantProps<typeof eventBadgeVariants>["color"];

	const eventBadgeClasses = cn(
		eventBadgeVariants({ color, multiDayPosition: position, className }),
	);

	return (
		<DraggableEvent event={event}>
			<EventDetailsDialog event={event}>
				<div role="button" tabIndex={0} className={eventBadgeClasses}>
					<div className="flex items-center gap-1.5 truncate min-h-full">
						{!["middle", "last"].includes(position) &&
							badgeVariant === "dot" && (
								<EventBullet color={event.color} />
							)}

						{renderBadgeText && (
							<p className="flex-1 truncate font-medium leading-tight flex items-center">
								{eventCurrentDay && (
									<span className="text-xs opacity-75 mr-1">
										Day {eventCurrentDay} of {eventTotalDays} •{" "}
									</span>
								)}
								<span className="truncate">{event.title}</span>
							</p>
						)}
					</div>

					<div className="hidden sm:flex items-center">
						{renderBadgeTime && (
							<span className="text-xs opacity-90">
							{formatTime(new Date(event.startDate), use24HourFormat)}
						</span>
						)}
					</div>
				</div>
			</EventDetailsDialog>
		</DraggableEvent>
	);
}
