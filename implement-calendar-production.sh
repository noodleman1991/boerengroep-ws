#!/bin/bash

# TinaCMS Calendar Implementation Script (No Mocks, Event Type Filtering Only)
# This script implements the full calendar integration with TinaCMS and real content

set -e  # Exit on any error

echo "🚀 Starting TinaCMS Calendar Implementation (Production Ready)..."
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Create backup directory
BACKUP_DIR="calendar_implementation_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
print_status "Created backup directory: $BACKUP_DIR"

# Function to backup file if it exists
backup_file() {
    if [ -f "$1" ]; then
        cp "$1" "$BACKUP_DIR/$(basename $1)"
        print_status "Backed up: $1"
    fi
}

# Function to create directory if it doesn't exist
ensure_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_status "Created directory: $1"
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "tina" ]; then
    print_error "Please run this script from your project root directory (where package.json and tina/ exist)"
    exit 1
fi

print_info "Detected project structure, proceeding with implementation..."

# 1. Backup existing files
print_info "Creating backups of existing files..."
backup_file "components/calendar/calendar.tsx"
backup_file "components/calendar/contexts/calendar-context.tsx"
backup_file "components/calendar/mocks.ts"
backup_file "components/calendar/requests.ts"
backup_file "components/calendar/header/filter.tsx"
backup_file "tina/config.tsx"
backup_file "tina/queries/queries.gql"
backup_file "tailwind.config.js"
backup_file "tailwind.config.ts"

# 2. Ensure required directories exist
print_info "Creating required directories..."
ensure_dir "content/events"
ensure_dir "content/events/nl"
ensure_dir "content/events/en"
ensure_dir "content/speakers"
ensure_dir "app/[locale]/activities/calendar"
ensure_dir "public/uploads/speakers"
ensure_dir "public/uploads/events"

# 3. Update Calendar Component
print_info "Updating Calendar component..."
cat > "components/calendar/calendar.tsx" << 'EOF'
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
EOF
print_status "Updated components/calendar/calendar.tsx"

# 4. Update Calendar Context (Remove Color Filtering)
print_info "Updating Calendar context (removing color filtering)..."
cat > "components/calendar/contexts/calendar-context.tsx" << 'EOF'
"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks";
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
EOF
print_status "Updated components/calendar/contexts/calendar-context.tsx"

# 5. Update Filter Component (Remove Color Filtering)
print_info "Updating filter component..."
cat > "components/calendar/header/filter.tsx" << 'EOF'
"use client";

import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
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
import {EVENT_COLORS, EVENT_TYPE_LABELS, type TEventType} from "../types";

export function FilterEvents() {
    const { selectedEventTypes, filterEventsByEventType, clearFilter } = useCalendar();

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
                <Toggle variant="outline" className="cursor-pointer w-fit">
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
                    const label = EVENT_TYPE_LABELS[eventType];
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
                            <div
                                className={`size-3.5 rounded-full bg-${color}-600 dark:bg-${color}-700`}
                            />
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
                    Clear Filter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
EOF
print_status "Updated components/calendar/header/filter.tsx"

# 6. Update Agenda Events (Remove Color Filtering)
print_info "Updating agenda events component..."
cat > "components/calendar/views/agenda-view/agenda-events.tsx" << 'EOF'
import {format, parseISO} from "date-fns";
import type {FC} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {useCalendar} from "../../contexts/calendar-context";
import {EventDetailsDialog} from "../../dialogs/event-details-dialog";
import {
    formatTime,
    getBgColor,
    getColorClass, getEventsForMonth,
    getFirstLetters,
    toCapitalize,
} from "../../helpers";
import {EventBullet} from "../../views/month-view/event-bullet";
import { EVENT_TYPE_LABELS } from "../../types";

export const AgendaEvents: FC = () => {
    const {events, badgeVariant, use24HourFormat, agendaModeGroupBy, selectedDate} =
        useCalendar();

    const monthEvents = getEventsForMonth(events, selectedDate)

    const agendaEvents = Object.groupBy(monthEvents, (event) => {
        return agendaModeGroupBy === "date"
            ? format(parseISO(event.startDate), "yyyy-MM-dd")
            : event.eventType;
    });

    const groupedAndSortedEvents = Object.entries(agendaEvents).sort(
        (a, b) => {
            if (agendaModeGroupBy === "date") {
                return new Date(a[0]).getTime() - new Date(b[0]).getTime();
            } else {
                return a[0].localeCompare(b[0]);
            }
        }
    );

    return (
        <Command className="py-4 h-[80vh] bg-transparent">
            <div className="mb-4 mx-4">
                <CommandInput placeholder="Type a command or search..."/>
            </div>
            <CommandList className="max-h-max px-3 border-t">
                {groupedAndSortedEvents.map(([key, groupedEvents]) => (
                    <CommandGroup
                        key={key}
                        heading={
                            agendaModeGroupBy === "date"
                                ? format(parseISO(key), "EEEE, MMMM d, yyyy")
                                : EVENT_TYPE_LABELS[key as keyof typeof EVENT_TYPE_LABELS] || toCapitalize(key)
                        }
                    >
                        {groupedEvents!.map((event) => (
                            <CommandItem
                                key={event.id}
                                className={cn(
                                    "mb-2 p-4 border rounded-md data-[selected=true]:bg-bg transition-all data-[selected=true]:text-none hover:cursor-pointer",
                                    {
                                        [getColorClass(event.color)]: badgeVariant === "colored",
                                        "hover:bg-zinc-200 dark:hover:bg-gray-900":
                                            badgeVariant === "dot",
                                        "hover:opacity-60": badgeVariant === "colored",
                                    },
                                )}
                            >
                                <EventDetailsDialog event={event}>
                                    <div className="w-full flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            {badgeVariant === "dot" ? (
                                                <EventBullet color={event.color}/>
                                            ) : (
                                                <Avatar>
                                                    <AvatarImage src="" alt="@shadcn"/>
                                                    <AvatarFallback className={getBgColor(event.color)}>
                                                        {getFirstLetters(event.title)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                <p
                                                    className={cn({
                                                        "font-medium": badgeVariant === "dot",
                                                        "text-foreground": badgeVariant === "dot",
                                                    })}
                                                >
                                                    {event.title}
                                                </p>
                                                <p className="text-muted-foreground text-sm line-clamp-1 text-ellipsis md:text-clip w-1/3">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-40 flex justify-center items-center gap-1">
                                            {agendaModeGroupBy === "date" ? (
                                                <>
                                                    <p className="text-sm">
                                                        {formatTime(event.startDate, use24HourFormat)}
                                                    </p>
                                                    <span className="text-muted-foreground">-</span>
                                                    <p className="text-sm">
                                                        {formatTime(event.endDate, use24HourFormat)}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm">
                                                        {format(event.startDate, "MM/dd/yyyy")}
                                                    </p>
                                                    <span className="text-sm">at</span>
                                                    <p className="text-sm">
                                                        {formatTime(event.startDate, use24HourFormat)}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </EventDetailsDialog>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
                <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
        </Command>
    );
};
EOF
print_status "Updated components/calendar/views/agenda-view/agenda-events.tsx"

# 7. Remove Mocks and Requests Files
print_info "Removing mock content..."
if [ -f "components/calendar/mocks.ts" ]; then
    rm "components/calendar/mocks.ts"
    print_status "Removed components/calendar/mocks.ts"
fi

if [ -f "components/calendar/requests.ts" ]; then
    rm "components/calendar/requests.ts"
    print_status "Removed components/calendar/requests.ts"
fi

# 8. Create Speaker Collection
print_info "Creating Speaker collection..."
cat > "tina/collection/speaker.ts" << 'EOF'
import type { Collection } from "@tinacms/cli";

const Speaker: Collection = {
    label: "Speakers",
    name: "speaker",
    path: "content/speakers",
    format: "md",
    fields: [
        {
            type: "string",
            label: "Name",
            name: "name",
            isTitle: true,
            required: true,
        },
        {
            type: "image",
            label: "Avatar",
            name: "avatar",
            // @ts-ignore
            uploadDir: () => "speakers",
        },
        {
            type: "string",
            label: "Affiliation",
            name: "affiliation",
        },
        {
            type: "rich-text",
            label: "Bio",
            name: "bio",
        },
    ],
};

export default Speaker;
EOF
print_status "Created tina/collection/speaker.ts"

# 9. Update TinaCMS Config
print_info "Updating TinaCMS config..."
cat > "tina/config.tsx" << 'EOF'
import { defineConfig } from "tinacms";
import { baseConfig } from '../next.config.base.js';

import Post from "./collection/post";
import Global from "./collection/global";
import Author from "./collection/author";
import Page from "./collection/page";
import Tag from "./collection/tag";
import Event from "./collection/event";
import Speaker from "./collection/speaker";

const config = defineConfig({
    clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID!,
    branch:
        process.env.NEXT_PUBLIC_TINA_BRANCH! || // custom branch env override
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! || // Vercel branch env
        process.env.HEAD!, // Netlify branch env
        token: process.env.TINA_TOKEN!,
    media: {
        // If you wanted cloudinary do this
        // loadCustomStore: async () => {
        //   const pack = await import("next-tinacms-cloudinary");
        //   return pack.TinaCloudCloudinaryMediaStore;
        // },
        // this is the config for the tina cloud media store
        tina: {
            publicFolder: "public",
            mediaRoot: "uploads",
        },
    },
    build: {
        publicFolder: "public", // The public asset folder for your framework
        outputFolder: "admin", // within the public folder
        basePath: baseConfig.basePath?.replace(/^\//, '') || '',
    },
    schema: {
        collections: [Page, Post, Author, Tag, Global, Event, Speaker],
    },
});

export default config;
EOF
print_status "Updated tina/config.tsx"

# 10. Update GraphQL queries
print_info "Updating GraphQL queries..."
cat >> "tina/queries/queries.gql" << 'EOF'

query calendarQuery {
  eventConnection {
    edges {
      node {
        id
        title
        description
        startDate
        endDate
        eventType
        location {
          address
          mapsLink
          callLink
        }
        speakers {
          speaker {
            ... on Speaker {
              id
              name
              avatar
              affiliation
            }
          }
          role
        }
        featured
        _sys {
          filename
          basename
          breadcrumbs
          path
          relativePath
        }
      }
    }
  }
}
EOF
print_status "Updated tina/queries/queries.gql"

# 11. Create Calendar Page
print_info "Creating Calendar page..."
cat > "app/[locale]/activities/calendar/page.tsx" << 'EOF'
import { Metadata } from 'next';
import { client } from '@/tina/__generated__/client';
import { Calendar } from '@/components/calendar/calendar';

export const metadata: Metadata = {
  title: 'Event Calendar - Stichting Boerengroep',
  description: 'View upcoming events and activities at Stichting Boerengroep.',
};

async function getCalendarData() {
  try {
    const data = await client.queries.calendarQuery();
    return {
      events: data.data?.eventConnection?.edges?.map(edge => edge?.node).filter(Boolean) || [],
      global: data.data?.global,
    };
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return {
      events: [],
      global: null,
    };
  }
}

export default async function CalendarPage() {
  const { events } = await getCalendarData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Event Calendar</h1>
        <p className="text-muted-foreground">
          View all upcoming events, workshops, meetings, and activities.
        </p>
        {events.length === 0 && (
          <div className="mt-4 p-4 border border-dashed rounded-lg text-center">
            <p className="text-muted-foreground">
              No events found. Add events through the{' '}
              <a href="/admin" className="text-primary hover:underline">
                TinaCMS admin panel
              </a>
              .
            </p>
          </div>
        )}
      </div>

      <Calendar events={events} />
    </div>
  );
}
EOF
print_status "Created app/[locale]/activities/calendar/page.tsx"

# 12. Create realistic content for Stichting Boerengroep
print_info "Creating realistic speakers..."

# Speaker: Dr. Maria van der Meer (Agricultural Sustainability Expert)
cat > "content/speakers/dr-maria-van-der-meer.md" << 'EOF'
---
name: "Dr. Maria van der Meer"
avatar: "/uploads/speakers/dr-maria-van-der-meer.jpg"
affiliation: "Wageningen Universiteit & Research"
bio: "Dr. Maria van der Meer is een toonaangevende onderzoeker in duurzame landbouw met meer dan 20 jaar ervaring in bodemvruchtbaarheid en regeneratieve landbouwpraktijken. Zij is gespecialiseerd in ecologische landbouwsystemen en heeft uitgebreid onderzoek gedaan naar de impact van klimaatverandering op Nederlandse landbouwgronden."
---
EOF

# Speaker: Pieter Janssen (Organic Farmer)
cat > "content/speakers/pieter-janssen.md" << 'EOF'
---
name: "Pieter Janssen"
avatar: "/uploads/speakers/pieter-janssen.jpg"
affiliation: "Biologische Boerderij De Groene Akker"
bio: "Pieter Janssen is een biologische boer met 15 jaar ervaring in duurzame voedselproductie. Hij runt een 50-hectare biologische gemengde boerderij in de Betuwe en is actief betrokken bij Community Supported Agriculture (CSA) projecten. Pieter geeft regelmatig lezingen over de overgang van conventionele naar biologische landbouw."
---
EOF

# Speaker: Prof. Dr. Johanna de Wit (Food Systems)
cat > "content/speakers/prof-dr-johanna-de-wit.md" << 'EOF'
---
name: "Prof. Dr. Johanna de Wit"
avatar: "/uploads/speakers/prof-dr-johanna-de-wit.jpg"
affiliation: "Universiteit Utrecht, Copernicus Instituut"
bio: "Prof. Dr. Johanna de Wit is een gerenommeerde expert op het gebied van duurzame voedselsystemen en voedselzekerheid. Zij leidt onderzoek naar de transitie naar duurzame landbouw en de rol van lokale voedselnetwerken. Haar werk richt zich op de sociale en economische aspecten van voedselproductie en -distributie."
---
EOF

# Speaker: Tom van Houten (Young Farmer)
cat > "content/speakers/tom-van-houten.md" << 'EOF'
---
name: "Tom van Houten"
avatar: "/uploads/speakers/tom-van-houten.jpg"
affiliation: "Nederlandse Jonge Boeren Vereniging"
bio: "Tom van Houten is een jonge boer en voorzitter van de Nederlandse Jonge Boeren Vereniging. Hij zet zich in voor de toekomst van de Nederlandse landbouw en de uitdagingen waarmee jonge boeren worden geconfronteerd. Tom combineert traditionele landbouwkennis met innovatieve technologieën en duurzame praktijken."
---
EOF

# Speaker: Lisa Vermeulen (Policy Advisor)
cat > "content/speakers/lisa-vermeulen.md" << 'EOF'
---
name: "Lisa Vermeulen"
avatar: "/uploads/speakers/lisa-vermeulen.jpg"
affiliation: "Ministerie van Landbouw, Natuur en Voedselkwaliteit"
bio: "Lisa Vermeulen is beleidadviseur bij het Ministerie van LNV en specialist in landbouwbeleid en EU-regelgeving. Zij heeft uitgebreide ervaring in de ontwikkeling van beleid voor duurzame landbouw en is betrokken bij de implementatie van de EU Green Deal in Nederland."
---
EOF

print_status "Created realistic speakers"

print_info "Creating realistic events..."

# Event: Workshop Regenerative Agriculture
cat > "content/events/nl/workshop-regeneratieve-landbouw.mdx" << 'EOF'
---
title: "Workshop: Regeneratieve Landbouw in de Praktijk"
description: "Leer over regeneratieve landbouwpraktijken die de bodemgezondheid herstellen en de biodiversiteit bevorderen."
location:
  address: "Wageningen University & Research, Orion Building, Zaal A0.05"
  mapsLink: "https://maps.google.com/?q=Wageningen+University+Orion+Building"
  callLink: ""
startDate: "2025-01-15T13:30:00.000Z"
endDate: "2025-01-15T17:00:00.000Z"
eventType: "workshop"
speakers:
  - speaker: "content/speakers/dr-maria-van-der-meer.md"
    role: "Hoofdspreker"
  - speaker: "content/speakers/pieter-janssen.md"
    role: "Praktijkexpert"
featured: true
---

Deze workshop biedt een uitgebreide introductie tot regeneratieve landbouw en hoe deze praktijken kunnen worden toegepast in de Nederlandse context. We behandelen onderwerpen zoals:

- Bodemgezondheid en koolstofvastlegging
- Gewasrotatie en groenbemesters
- Geïntegreerd onkruidbeheer
- Biodiversiteit op het bedrijf

De workshop combineert theoretische kennis met praktische voorbeelden van Nederlandse boeren die al regeneratieve methoden toepassen.
EOF

# Event: CSA Information Session
cat > "content/events/nl/informatiesessie-csa.mdx" << 'EOF'
---
title: "Informatiesessie: Community Supported Agriculture (CSA)"
description: "Ontdek hoe CSA werkt en hoe je een lokaal voedselnetwerk kunt opzetten in jouw gemeenschap."
location:
  address: "De Boerengroep, Zaagmuldersweg 1, 6703 JK Wageningen"
  mapsLink: "https://maps.google.com/?q=Zaagmuldersweg+1+Wageningen"
  callLink: ""
startDate: "2025-01-22T19:00:00.000Z"
endDate: "2025-01-22T21:00:00.000Z"
eventType: "csa"
speakers:
  - speaker: "content/speakers/pieter-janssen.md"
    role: "CSA Coordinator"
featured: false
---

Community Supported Agriculture (CSA) biedt een directe verbinding tussen producenten en consumenten. In deze informatiesessie bespreken we:

- Wat is CSA en hoe werkt het?
- Voordelen voor boeren en consumenten
- Praktische stappen voor het opzetten van een CSA
- Ervaringen van bestaande CSA-projecten in Nederland

Perfect voor boeren die interesse hebben in directe verkoop en consumenten die lokaal en duurzaam voedsel willen ondersteunen.
EOF

# Event: Board Meeting
cat > "content/events/nl/bestuursvergadering-januari.mdx" << 'EOF'
---
title: "Bestuursvergadering Januari 2025"
description: "Maandelijkse bestuursvergadering van Stichting Boerengroep."
location:
  address: "De Boerengroep Kantoor, Zaagmuldersweg 1, 6703 JK Wageningen"
  mapsLink: ""
  callLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc123"
startDate: "2025-01-10T14:00:00.000Z"
endDate: "2025-01-10T16:00:00.000Z"
eventType: "board-meeting"
speakers: []
featured: false
---

Maandelijkse bestuursvergadering ter bespreking van:

- Voortgang lopende projecten
- Financiële zaken
- Evenementen planning voor Q1 2025
- Nieuwe initiatieven en samenwerkingen
EOF

# Event: Soup Kitchen
cat > "content/events/nl/soepkeuken-wageningen.mdx" << 'EOF'
---
title: "Boerengroep Soepkeuken - Wageningen"
description: "Wekelijkse soepkeuken met verse, lokale ingrediënten voor iedereen in de gemeenschap."
location:
  address: "Wijkcentrum De Bouwsteen, Nijelaan 35, 6703 BN Wageningen"
  mapsLink: "https://maps.google.com/?q=Wijkcentrum+De+Bouwsteen+Wageningen"
  callLink: ""
startDate: "2025-01-16T17:30:00.000Z"
endDate: "2025-01-16T19:30:00.000Z"
eventType: "soup-kitchen"
speakers: []
featured: false
---

Elke donderdag organiseert de Boerengroep een gemeenschapssoepkeuken waar iedereen welkom is voor een warme, voedzame maaltijd bereid met verse, lokale ingrediënten.

**Wat bieden we:**
- Gratis warme soep en brood
- Gezelligheid en gemeenschapsgevoel
- Informatie over lokale voedselinitiatieven

**Hulp nodig?**
We zijn altijd op zoek naar vrijwilligers om te helpen met koken, serveren en opruimen. Meld je aan als je wilt helpen!
EOF

# Event: Lecture Food Systems
cat > "content/events/nl/lezing-toekomst-voedselsystemen.mdx" << 'EOF'
---
title: "Lezing: De Toekomst van Nederlandse Voedselsystemen"
description: "Een diepgaande analyse van de uitdagingen en kansen voor duurzame voedselproductie in Nederland."
location:
  address: "Universiteit Utrecht, Bestuursgebouw, Collegezaal 001"
  mapsLink: "https://maps.google.com/?q=Universiteit+Utrecht+Bestuursgebouw"
  callLink: "https://uu-nl.zoom.us/j/12345678"
startDate: "2025-02-05T14:00:00.000Z"
endDate: "2025-02-05T16:00:00.000Z"
eventType: "lecture"
speakers:
  - speaker: "content/speakers/prof-dr-johanna-de-wit.md"
    role: "Hoofdspreker"
featured: true
---

In deze lezing behandelt Prof. Dr. Johanna de Wit de grote uitdagingen en kansen voor Nederlandse voedselsystemen. Onderwerpen die aan bod komen:

- Klimaatverandering en landbouw
- De rol van technologie in duurzame voedselproductie
- Lokale voedselnetwerken en korte ketens
- Beleid en regelgeving voor voedseltransitie
- Circulaire landbouw en afvalvermindering

De lezing is bedoeld voor studenten, onderzoekers, beleidsmakers en iedereen die geïnteresseerd is in de toekomst van ons voedselsysteem.
EOF

# Event: Young Farmers Talk
cat > "content/events/nl/talk-jonge-boeren.mdx" << 'EOF'
---
title: "Talk: Uitdagingen voor Jonge Boeren in Nederland"
description: "Een eerlijk gesprek over de obstakels en kansen voor de nieuwe generatie landbouwers."
location:
  address: "Boerengroep Café, Markt 15, 6701 CL Wageningen"
  mapsLink: "https://maps.google.com/?q=Markt+15+Wageningen"
  callLink: ""
startDate: "2025-01-28T20:00:00.000Z"
endDate: "2025-01-28T22:00:00.000Z"
eventType: "talk"
speakers:
  - speaker: "content/speakers/tom-van-houten.md"
    role: "Spreker"
featured: false
---

Tom van Houten, voorzitter van de Nederlandse Jonge Boeren Vereniging, deelt zijn inzichten over de uitdagingen waarmee jonge boeren worden geconfronteerd:

- Toegang tot land en financiering
- Kennisoverdracht tussen generaties
- Innovatie en traditie combineren
- Duurzaamheid en rentabiliteit
- Toekomstperspectieven voor de landbouwsector

Na de presentatie is er ruimte voor vragen en discussie. Een informele setting om in gesprek te gaan over de toekomst van de Nederlandse landbouw.
EOF

# Event: Policy Meeting
cat > "content/events/nl/beleid-bijeenkomst-eu-green-deal.mdx" << 'EOF'
---
title: "Beleidsbijeenkomst: EU Green Deal en Nederlandse Landbouw"
description: "Bespreking van de implicaties van de EU Green Deal voor Nederlandse landbouwbedrijven."
location:
  address: "Ministerie LNV, Bezuidenhoutseweg 73, 2594 AC Den Haag"
  mapsLink: "https://maps.google.com/?q=Ministerie+LNV+Den+Haag"
  callLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_def456"
startDate: "2025-02-12T10:00:00.000Z"
endDate: "2025-02-12T12:30:00.000Z"
eventType: "meeting"
speakers:
  - speaker: "content/speakers/lisa-vermeulen.md"
    role: "Beleidadviseur"
featured: false
---

Een informatieve bijeenkomst over de EU Green Deal en de specifieke implicaties voor Nederlandse landbouwbedrijven. Onderwerpen:

- Overzicht van Green Deal doelstellingen
- Van Boer tot Bord strategie
- Biodiversiteitsstrategie 2030
- Financiële ondersteuning en subsidies
- Transitieperiode en implementatie
- Praktische stappen voor boeren

De bijeenkomst is bedoeld voor landbouwers, adviseurs en belangenorganisaties die meer willen weten over de komende veranderingen in het landbouwbeleid.
EOF

# Event: Farm Excursion
cat > "content/events/nl/excursie-biologische-boerderij.mdx" << 'EOF'
---
title: "Excursie: Biologische Boerderij De Groene Akker"
description: "Bezoek aan een biologische gemengde boerderij om duurzame landbouwpraktijken in actie te zien."
location:
  address: "Biologische Boerderij De Groene Akker, Rivierweg 42, 6669 ZB Dodewaard"
  mapsLink: "https://maps.google.com/?q=Rivierweg+42+Dodewaard"
  callLink: ""
startDate: "2025-02-20T09:00:00.000Z"
endDate: "2025-02-20T16:00:00.000Z"
eventType: "excursion"
speakers:
  - speaker: "content/speakers/pieter-janssen.md"
    role: "Boer en Gids"
featured: true
---

Een hele dag op bezoek bij Biologische Boerderij De Groene Akker om te zien hoe duurzame landbouw in de praktijk werkt.

**Programma:**
- 09:00 - Ontvangst met koffie en kennismaking
- 09:30 - Rondleiding door de boerderij
- 11:00 - Workshop bodemgezondheid
- 12:30 - Lunch met producten van de boerderij
- 14:00 - Praktijkdemonstratie gewasrotatie
- 15:30 - Discussie en Q&A
- 16:00 - Afsluiting

**Praktische informatie:**
- Draag stevige schoenen en kleding die vies mag worden
- Vervoer: eigen vervoer of carpoolen (wordt georganiseerd)
- Lunch is inbegrepen
- Maximaal 25 deelnemers

Een unieke kans om van dichtbij te ervaren hoe biologische landbouw werkt en direct vragen te stellen aan een ervaren biologische boer.
EOF

print_status "Created realistic events for Stichting Boerengroep"

# 13. Create/Update Tailwind Config (TypeScript)
print_info "Creating Tailwind config with calendar colors..."

# Backup existing tailwind config if it exists
if [ -f "tailwind.config.js" ]; then
    backup_file "tailwind.config.js"
fi
if [ -f "tailwind.config.ts" ]; then
    backup_file "tailwind.config.ts"
fi

cat > "tailwind.config.ts" << 'EOF'
import type { Config } from 'tailwindcss';

const calendarColors = [
  // Background colors for event types
  'bg-blue-50', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-950',
  'bg-green-50', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-950',
  'bg-purple-50', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-950',
  'bg-orange-50', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-950',
  'bg-red-50', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-950',
  'bg-yellow-50', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-950',
  'bg-pink-50', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-950',
  'bg-teal-50', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-950',

  // Border colors
  'border-blue-200', 'border-blue-800', 'border-green-200', 'border-green-800',
  'border-purple-200', 'border-purple-800', 'border-orange-200', 'border-orange-800',
  'border-red-200', 'border-red-800', 'border-yellow-200', 'border-yellow-800',
  'border-pink-200', 'border-pink-800', 'border-teal-200', 'border-teal-800',

  // Text colors
  'text-blue-300', 'text-blue-700', 'text-green-300', 'text-green-700',
  'text-purple-300', 'text-purple-700', 'text-orange-300', 'text-orange-700',
  'text-red-300', 'text-red-700', 'text-yellow-300', 'text-yellow-700',
  'text-pink-300', 'text-pink-700', 'text-teal-300', 'text-teal-700',

  // Hover states
  'hover:bg-blue-400', 'hover:bg-blue-700', 'hover:bg-green-400', 'hover:bg-green-700',
  'hover:bg-purple-400', 'hover:bg-purple-700', 'hover:bg-orange-400', 'hover:bg-orange-700',
  'hover:bg-red-400', 'hover:bg-red-700', 'hover:bg-yellow-400', 'hover:bg-yellow-700',
  'hover:bg-pink-400', 'hover:bg-pink-700', 'hover:bg-teal-400', 'hover:bg-teal-700',

  // Dark mode variants
  'dark:bg-blue-500', 'dark:bg-blue-950', 'dark:bg-green-500', 'dark:bg-green-950',
  'dark:bg-purple-500', 'dark:bg-purple-950', 'dark:bg-orange-500', 'dark:bg-orange-950',
  'dark:bg-red-500', 'dark:bg-red-950', 'dark:bg-yellow-500', 'dark:bg-yellow-950',
  'dark:bg-pink-500', 'dark:bg-pink-950', 'dark:bg-teal-500', 'dark:bg-teal-950',
  'dark:border-blue-800', 'dark:border-green-800', 'dark:border-purple-800', 'dark:border-orange-800',
  'dark:border-red-800', 'dark:border-yellow-800', 'dark:border-pink-800', 'dark:border-teal-800',
  'dark:text-blue-300', 'dark:text-green-300', 'dark:text-purple-300', 'dark:text-orange-300',
  'dark:text-red-300', 'dark:text-yellow-300', 'dark:text-pink-300', 'dark:text-teal-300',
  'dark:hover:bg-blue-400', 'dark:hover:bg-green-400', 'dark:hover:bg-purple-400', 'dark:hover:bg-orange-400',
  'dark:hover:bg-red-400', 'dark:hover:bg-yellow-400', 'dark:hover:bg-pink-400', 'dark:hover:bg-teal-400',
];

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  safelist: [
    ...calendarColors,
    // Add any other classes that should never be purged
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
  ],
  plugins: [
    // Only include tailwindcss-animate if it exists
    ...((() => {
      try {
        return [require('tailwindcss-animate')];
      } catch {
        return [];
      }
    })()),
  ],
};

export default config;
EOF
print_status "Created tailwind.config.ts with calendar colors"

echo ""
echo "=============================================="
print_status "Production-ready Calendar implementation completed!"
echo "=============================================="
echo ""

print_info "What was implemented:"
echo "✅ Removed all mock content"
echo "✅ Created realistic Dutch agricultural content"
echo "✅ Removed color filtering (event type filtering only)"
echo "✅ Created complete tailwind.config.ts with calendar colors"
echo "✅ 5 speakers with agricultural expertise"
echo "✅ 8 realistic events for Stichting Boerengroep"
echo "✅ Updated filter to work with event types only"
echo "✅ Calendar integrates directly with TinaCMS"
echo ""

print_info "Next steps:"
echo "1. Regenerate TinaCMS types:"
echo "   pnpm exec tinacms build --local"
echo ""
echo "2. Install tailwindcss-animate if not already installed:"
echo "   pnpm add tailwindcss-animate"
echo ""
echo "3. Start your development server:"
echo "   pnpm run dev"
echo ""
echo "4. Visit your calendar page:"
echo "   http://localhost:3000/nl/activities/calendar"
echo ""
echo "5. Manage events through TinaCMS admin:"
echo "   http://localhost:3000/admin"
echo ""

print_warning "Files backed up in: $BACKUP_DIR"
print_info "Content created includes realistic Dutch agricultural speakers and events"

echo ""
print_status "Production-ready implementation completed! 🎉"
