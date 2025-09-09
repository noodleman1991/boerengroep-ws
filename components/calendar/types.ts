// Calendar view
export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";

// Available event colors
export type TEventColor =
    | "blue"
    | "green"
    | "red"
    | "yellow"
    | "purple"
    | "orange"
    | "pink"
    | "teal"
    | "lime"
    | "tan"
    | "navy";

// Event types
export type TEventType =
    | "talk"
    | "workshop"
    | "lecture"
    | "meeting"
    | "board-meeting"
    | "soup-kitchen"
    | "csa"
    | "excursion";

// Event → Color mapping using brand colors
export const EVENT_COLORS: Record<TEventType, TEventColor> = {
    talk: "blue",        // Brand blue
    workshop: "green",   // Brand green  
    lecture: "navy",     // Brand navy
    meeting: "orange",   // Brand orange
    "board-meeting": "red",
    "soup-kitchen": "lime",  // Brand lime
    csa: "tan",         // Brand tan
    excursion: "teal",
};

// Event → Label mapping
export const EVENT_TYPE_LABELS: Record<TEventType, string> = {
    talk: "Talk",
    workshop: "Workshop",
    lecture: "Lecture",
    meeting: "Meeting",
    "board-meeting": "Board Meeting",
    "soup-kitchen": "Soup Kitchen",
    csa: "Community Supported Agriculture",
    excursion: "Excursion",
};
