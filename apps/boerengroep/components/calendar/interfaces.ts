import type {TEventColor, TEventType} from "./types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	title: string;
	color: TEventColor;
    eventType: TEventType;
	description: string;
	user: IUser;
	image?: string;
	coverImage?: string;
	registrationLink?: any; // Can be string (legacy) or TinaMarkdownContent (rich-text)
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
