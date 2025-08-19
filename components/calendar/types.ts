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
    | "teal";

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

// Event → Color mapping
export const EVENT_COLORS: Record<TEventType, TEventColor> = {
    talk: "blue",
    workshop: "green",
    lecture: "purple",
    meeting: "orange",
    "board-meeting": "red",
    "soup-kitchen": "yellow",
    csa: "pink",
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
