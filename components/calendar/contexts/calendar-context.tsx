"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { IEvent, IUser } from "../interfaces";
import type { TCalendarView, TEventType } from "../types";
import { EVENT_COLORS } from "../types";

interface ICalendarContext {
    selectedDate: Date;
    view: TCalendarView;
    setView: (view: TCalendarView) => void;
    agendaModeGroupBy: "date" | "eventType";
    setAgendaModeGroupBy: (groupBy: "date" | "eventType") => void;
    use24HourFormat: boolean;
    toggleTimeFormat: () => void;
    setSelectedDate: (date: Date | undefined) => void;
    selectedUserId: IUser["id"] | "all";
    setSelectedUserId: (userId: IUser["id"] | "all") => void;
    badgeVariant: "dot" | "colored";
    setBadgeVariant: (variant: "dot" | "colored") => void;
    selectedEventTypes: TEventType[];
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
    agendaModeGroupBy: "date" | "eventType";
}

const DEFAULT_SETTINGS: CalendarSettings = {
    badgeVariant: "colored",
    view: "month",
    use24HourFormat: true,
    agendaModeGroupBy: "date",
};

// Safe localStorage hook that prevents hydration issues
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage after hydration
    useEffect(() => {
        setIsHydrated(true);
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (isHydrated && typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
                                     children,
                                     initialEvents = [],
                                     badge = "colored",
                                     view = "month",
                                 }: {
    children: React.ReactNode;
    initialEvents?: any[];
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
        "date" | "eventType"
    >(settings.agendaModeGroupBy);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");
    const [selectedEventTypes, setSelectedEventTypes] = useState<TEventType[]>([]);

    const [users, setUsers] = useState<IUser[]>([]);
    const [allEvents, setAllEvents] = useState<IEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Transform and set events when initialEvents changes
    useEffect(() => {
        if (initialEvents.length > 0) {
            setIsLoading(true);
            const transformedEvents = transformTinaCMSEvents(initialEvents);
            setAllEvents(transformedEvents);
            setFilteredEvents(transformedEvents);

            // Extract unique users from events for filtering
            const uniqueUsers = extractUsersFromEvents(transformedEvents);
            setUsers(uniqueUsers);
            setIsLoading(false);
        } else {
            setAllEvents([]);
            setFilteredEvents([]);
            setUsers([]);
            setIsLoading(false);
        }
    }, [initialEvents]);

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

    const setAgendaModeGroupBy = (groupBy: "date" | "eventType") => {
        setAgendaModeGroupByState(groupBy);
        updateSettings({ agendaModeGroupBy: groupBy });
    };

    const filterEventsByEventType = (eventType: TEventType) => {
        const isTypeSelected = selectedEventTypes.includes(eventType);
        const newTypes = isTypeSelected
            ? selectedEventTypes.filter((t) => t !== eventType)
            : [...selectedEventTypes, eventType];

        applyFilters(newTypes, selectedUserId);
        setSelectedEventTypes(newTypes);
    };

    const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
        setSelectedUserId(userId);
        applyFilters(selectedEventTypes, userId);
    };

    const applyFilters = (types: TEventType[], userId: IUser["id"] | "all") => {
        let filtered = allEvents;

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
        selectedEventTypes,
        filterEventsByEventType,
        filterEventsBySelectedUser,
        events: filteredEvents,
        view: currentView,
        use24HourFormat,
        toggleTimeFormat,
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
        description: event.description || '',
        eventType: event.eventType || 'meeting',
        color: EVENT_COLORS[event.eventType as TEventType] || 'blue',
        location: event.location,
        speakers: event.speakers,
        featured: event.featured,
        // Create a user from the first speaker for compatibility
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
