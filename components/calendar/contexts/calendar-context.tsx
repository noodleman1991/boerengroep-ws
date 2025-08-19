// "use client";
//
// import type React from "react";
// import { createContext, useContext, useState } from "react";
// import { useLocalStorage } from "../hooks";
// import type { IEvent, IUser } from "../interfaces";
// import type {
// 	TCalendarView,
// 	TEventColor,
// } from "../types";
//
// interface ICalendarContext {
// 	selectedDate: Date;
// 	view: TCalendarView;
// 	setView: (view: TCalendarView) => void;
// 	agendaModeGroupBy: "date" | "color";
// 	setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
// 	use24HourFormat: boolean;
// 	toggleTimeFormat: () => void;
// 	setSelectedDate: (date: Date | undefined) => void;
// 	selectedUserId: IUser["id"] | "all";
// 	setSelectedUserId: (userId: IUser["id"] | "all") => void;
// 	badgeVariant: "dot" | "colored";
// 	setBadgeVariant: (variant: "dot" | "colored") => void;
// 	selectedColors: TEventColor[];
// 	filterEventsBySelectedColors: (colors: TEventColor) => void;
// 	filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
// 	users: IUser[];
// 	events: IEvent[];
// 	addEvent: (event: IEvent) => void;
// 	updateEvent: (event: IEvent) => void;
// 	removeEvent: (eventId: number) => void;
// 	clearFilter: () => void;
// }
//
// interface CalendarSettings {
// 	badgeVariant: "dot" | "colored";
// 	view: TCalendarView;
// 	use24HourFormat: boolean;
// 	agendaModeGroupBy: "date" | "color";
// }
//
// const DEFAULT_SETTINGS: CalendarSettings = {
// 	badgeVariant: "colored",
// 	view: "day",
// 	use24HourFormat: true,
// 	agendaModeGroupBy: "date",
// };
//
// const CalendarContext = createContext({} as ICalendarContext);
//
// export function CalendarProvider({
// 	children,
// 	users,
// 	events,
// 	badge = "colored",
// 	view = "day",
// }: {
// 	children: React.ReactNode;
// 	users: IUser[];
// 	events: IEvent[];
// 	view?: TCalendarView;
// 	badge?: "dot" | "colored";
// }) {
// 	const [settings, setSettings] = useLocalStorage<CalendarSettings>(
// 		"calendar-settings",
// 		{
// 			...DEFAULT_SETTINGS,
// 			badgeVariant: badge,
// 			view: view,
// 		},
// 	);
//
// 	const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
// 		settings.badgeVariant,
// 	);
// 	const [currentView, setCurrentViewState] = useState<TCalendarView>(
// 		settings.view,
// 	);
// 	const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
// 		settings.use24HourFormat,
// 	);
// 	const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
// 		"date" | "color"
// 	>(settings.agendaModeGroupBy);
//
// 	const [selectedDate, setSelectedDate] = useState(new Date());
// 	const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
// 		"all",
// 	);
// 	const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);
//
// 	const [allEvents, setAllEvents] = useState<IEvent[]>(events || []);
// 	const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events || []);
//
// 	const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
// 		setSettings({
// 			...settings,
// 			...newPartialSettings,
// 		});
// 	};
//
// 	const setBadgeVariant = (variant: "dot" | "colored") => {
// 		setBadgeVariantState(variant);
// 		updateSettings({ badgeVariant: variant });
// 	};
//
// 	const setView = (newView: TCalendarView) => {
// 		setCurrentViewState(newView);
// 		updateSettings({ view: newView });
// 	};
//
// 	const toggleTimeFormat = () => {
// 		const newValue = !use24HourFormat;
// 		setUse24HourFormatState(newValue);
// 		updateSettings({ use24HourFormat: newValue });
// 	};
//
// 	const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
// 		setAgendaModeGroupByState(groupBy);
// 		updateSettings({ agendaModeGroupBy: groupBy });
// 	};
//
// 	const filterEventsBySelectedColors = (color: TEventColor) => {
// 		const isColorSelected = selectedColors.includes(color);
// 		const newColors = isColorSelected
// 			? selectedColors.filter((c) => c !== color)
// 			: [...selectedColors, color];
//
// 		if (newColors.length > 0) {
// 			const filtered = allEvents.filter((event) => {
// 				const eventColor = event.color || "blue";
// 				return newColors.includes(eventColor);
// 			});
// 			setFilteredEvents(filtered);
// 		} else {
// 			setFilteredEvents(allEvents);
// 		}
//
// 		setSelectedColors(newColors);
// 	};
//
// 	const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
// 		setSelectedUserId(userId);
// 		if (userId === "all") {
// 			setFilteredEvents(allEvents);
// 		} else {
// 			const filtered = allEvents.filter((event) => event.user.id === userId);
// 			setFilteredEvents(filtered);
// 		}
// 	};
//
// 	const handleSelectDate = (date: Date | undefined) => {
// 		if (!date) return;
// 		setSelectedDate(date);
// 	};
//
// 	const addEvent = (event: IEvent) => {
// 		setAllEvents((prev) => [...prev, event]);
// 		setFilteredEvents((prev) => [...prev, event]);
// 	};
//
// 	const updateEvent = (event: IEvent) => {
// 		const updated = {
// 			...event,
// 			startDate: new Date(event.startDate).toISOString(),
// 			endDate: new Date(event.endDate).toISOString(),
// 		};
//
// 		setAllEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
// 		setFilteredEvents((prev) =>
// 			prev.map((e) => (e.id === event.id ? updated : e)),
// 		);
// 	};
//
// 	const removeEvent = (eventId: number) => {
// 		setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
// 		setFilteredEvents((prev) => prev.filter((e) => e.id !== eventId));
// 	};
//
// 	const clearFilter = () => {
// 		setFilteredEvents(allEvents);
// 		setSelectedColors([]);
// 		setSelectedUserId("all");
// 	};
//
// 	const value = {
// 		selectedDate,
// 		setSelectedDate: handleSelectDate,
// 		selectedUserId,
// 		setSelectedUserId,
// 		badgeVariant,
// 		setBadgeVariant,
// 		users,
// 		selectedColors,
// 		filterEventsBySelectedColors,
// 		filterEventsBySelectedUser,
// 		events: filteredEvents,
// 		view: currentView,
// 		use24HourFormat,
// 		toggleTimeFormat,
// 		setView,
// 		agendaModeGroupBy,
// 		setAgendaModeGroupBy,
// 		addEvent,
// 		updateEvent,
// 		removeEvent,
// 		clearFilter,
// 	};
//
// 	return (
// 		<CalendarContext.Provider value={value}>
// 			{children}
// 		</CalendarContext.Provider>
// 	);
// }
//
// export function useCalendar(): ICalendarContext {
// 	const context = useContext(CalendarContext);
// 	if (!context)
// 		throw new Error("useCalendar must be used within a CalendarProvider.");
// 	return context;
// }
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks";
import type { IEvent, IUser } from "../interfaces";
import type { TCalendarView, TEventColor, TEventType } from "../types";
import { EVENT_COLORS } from "../types";

interface ICalendarContext {
    selectedDate: Date;
    view: TCalendarView;
    setView: (view: TCalendarView) => void;
    agendaModeGroupBy: "date" | "color";
    setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
    use24HourFormat: boolean;
    toggleTimeFormat: () => void;
    setSelectedDate: (date: Date | undefined) => void;
    selectedUserId: IUser["id"] | "all";
    setSelectedUserId: (userId: IUser["id"] | "all") => void;
    badgeVariant: "dot" | "colored";
    setBadgeVariant: (variant: "dot" | "colored") => void;
    selectedColors: TEventColor[];
    selectedEventTypes: TEventType[]; // Add event type filtering
    filterEventsBySelectedColors: (colors: TEventColor) => void;
    filterEventsByEventType: (eventType: TEventType) => void;
    filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
    users: IUser[];
    events: IEvent[];
    clearFilter: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

interface CalendarSettings {
    badgeVariant: "dot" | "colored";
    view: TCalendarView;
    use24HourFormat: boolean;
    agendaModeGroupBy: "date" | "color";
}

const DEFAULT_SETTINGS: CalendarSettings = {
    badgeVariant: "colored",
    view: "month",
    use24HourFormat: true,
    agendaModeGroupBy: "date",
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
                                     children,
                                     badge = "colored",
                                     view = "month",
                                 }: {
    children: React.ReactNode;
    badge?: "dot" | "colored";
    view?: TCalendarView;
}) {
    const [settings, setSettings] = useLocalStorage<CalendarSettings>(
        "calendar-settings",
        {
            ...DEFAULT_SETTINGS,
            badgeVariant: badge,
            view: view,
        },
    );

    const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
        settings.badgeVariant,
    );
    const [currentView, setCurrentViewState] = useState<TCalendarView>(
        settings.view,
    );
    const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
        settings.use24HourFormat,
    );
    const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
        "date" | "color"
    >(settings.agendaModeGroupBy);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");
    const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);
    const [selectedEventTypes, setSelectedEventTypes] = useState<TEventType[]>([]);

    const [users, setUsers] = useState<IUser[]>([]);
    const [allEvents, setAllEvents] = useState<IEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch events from TinaCMS API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/events');
                if (response.ok) {
                    const data = await response.json();
                    const transformedEvents = transformTinaCMSEvents(data.events || []);
                    setAllEvents(transformedEvents);
                    setFilteredEvents(transformedEvents);

                    // Extract unique users from events for filtering
                    const uniqueUsers = extractUsersFromEvents(transformedEvents);
                    setUsers(uniqueUsers);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setAllEvents([]);
                setFilteredEvents([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
        setSettings({
            ...settings,
            ...newPartialSettings,
        });
    };

    const setBadgeVariant = (variant: "dot" | "colored") => {
        setBadgeVariantState(variant);
        updateSettings({ badgeVariant: variant });
    };

    const setView = (newView: TCalendarView) => {
        setCurrentViewState(newView);
        updateSettings({ view: newView });
    };

    const toggleTimeFormat = () => {
        const newValue = !use24HourFormat;
        setUse24HourFormatState(newValue);
        updateSettings({ use24HourFormat: newValue });
    };

    const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
        setAgendaModeGroupByState(groupBy);
        updateSettings({ agendaModeGroupBy: groupBy });
    };

    const filterEventsBySelectedColors = (color: TEventColor) => {
        const isColorSelected = selectedColors.includes(color);
        const newColors = isColorSelected
            ? selectedColors.filter((c) => c !== color)
            : [...selectedColors, color];

        applyFilters(newColors, selectedEventTypes, selectedUserId);
        setSelectedColors(newColors);
    };

    const filterEventsByEventType = (eventType: TEventType) => {
        const isTypeSelected = selectedEventTypes.includes(eventType);
        const newTypes = isTypeSelected
            ? selectedEventTypes.filter((t) => t !== eventType)
            : [...selectedEventTypes, eventType];

        applyFilters(selectedColors, newTypes, selectedUserId);
        setSelectedEventTypes(newTypes);
    };

    const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
        setSelectedUserId(userId);
        applyFilters(selectedColors, selectedEventTypes, userId);
    };

    const applyFilters = (colors: TEventColor[], types: TEventType[], userId: IUser["id"] | "all") => {
        let filtered = allEvents;

        // Filter by colors
        if (colors.length > 0) {
            filtered = filtered.filter((event) => colors.includes(event.color));
        }

        // Filter by event types
        if (types.length > 0) {
            filtered = filtered.filter((event) => types.includes(event.eventType));
        }

        // Filter by user
        if (userId !== "all") {
            filtered = filtered.filter((event) => event.user.id === userId);
        }

        setFilteredEvents(filtered);
    };

    const handleSelectDate = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
    };

    const clearFilter = () => {
        setFilteredEvents(allEvents);
        setSelectedColors([]);
        setSelectedEventTypes([]);
        setSelectedUserId("all");
    };

    const value = {
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        badgeVariant,
        setBadgeVariant,
        users,
        selectedColors,
        selectedEventTypes,
        filterEventsBySelectedColors,
        filterEventsByEventType,
        filterEventsBySelectedUser,
        events: filteredEvents,
        view: currentView,
        setView,
        agendaModeGroupBy,
        setAgendaModeGroupBy,
        clearFilter,
        isLoading,
        setIsLoading,
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar(): ICalendarContext {
    const context = useContext(CalendarContext);
    if (!context)
        throw new Error("useCalendar must be used within a CalendarProvider.");
    return context;
}

// Helper function to transform TinaCMS events to calendar format
function transformTinaCMSEvents(tinaCMSEvents: any[]): IEvent[] {
    return tinaCMSEvents.map((event, index) => ({
        id: event.id || index,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        title: event.title || '',
        description: event.description,
        eventType: event.eventType,
        color: EVENT_COLORS[event.eventType as TEventType] || 'blue',
        location: event.location,
        speakers: event.speakers,
        featured: event.featured,
        // Create a user from the first speaker for compatibility with yassir-jeraidi's system
        user: {
            id: event.speakers?.[0]?.speaker?.id || 'system',
            name: event.speakers?.[0]?.speaker?.name || 'System',
            picturePath: event.speakers?.[0]?.speaker?.avatar || null,
        },
    }));
}

// Helper function to extract unique users from events
function extractUsersFromEvents(events: IEvent[]): IUser[] {
    const userMap = new Map<string, IUser>();

    events.forEach(event => {
        if (event.user && !userMap.has(event.user.id)) {
            userMap.set(event.user.id, event.user);
        }
    });

    return Array.from(userMap.values());
}
