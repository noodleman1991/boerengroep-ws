import type { Collection } from "@tinacms/cli";

const Event: Collection = {
    label: "Events",
    name: "event",
    path: "content/events",
    format: "mdx",
    ui: {
        router: ({ document }: any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            // Check if first segment is a locale
            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                const path = breadcrumbs.slice(1);
                return `/${locale}/events/${path.join('/')}`;
            } else {
                // Non-localized content - default to first locale
                return `/nl/events/${breadcrumbs.join('/')}`;
            }
        },
    },
    fields: [
        {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
        },
        {
            type: "rich-text",
            label: "Description",
            name: "description",
            overrides: {
                toolbar: ['bold', 'italic', 'link', 'quote'],
            },
        },
        {
            type: "object",
            label: "Location",
            name: "location",
            fields: [
                {
                    type: "string",
                    label: "Address",
                    name: "address",
                },
                {
                    type: "string",
                    label: "Google Maps Link",
                    name: "mapsLink",
                    description: "Full Google Maps URL or search query",
                },
                {
                    type: "string",
                    label: "Video Call Link",
                    name: "callLink",
                    description: "Zoom, Teams, or other video call link",
                },
            ],
        },
        {
            type: "datetime",
            label: "Start Date & Time",
            name: "startDate",
            required: true,
            ui: {
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
            },
        },
        {
            type: "datetime",
            label: "End Date & Time (Optional)",
            name: "endDate",
            ui: {
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
            },
        },
        {
            type: "string",
            label: "Event Type",
            name: "eventType",
            required: true,
            options: [
                { label: "Talk", value: "talk" },
                { label: "Workshop", value: "workshop" },
                { label: "Lecture", value: "lecture" },
                { label: "Meeting", value: "meeting" },
                { label: "Board Meeting", value: "board-meeting" },
                { label: "Soup Kitchen", value: "soup-kitchen" },
                { label: "CSA", value: "csa" },
                { label: "Excursion", value: "excursion" },
            ],
        },
        {
            type: "object",
            label: "Speakers/Hosts",
            name: "speakers",
            list: true,
            fields: [
                {
                    type: "reference",
                    label: "Speaker",
                    name: "speaker",
                    collections: ["speaker"],
                },
                {
                    type: "string",
                    label: "Role",
                    name: "role",
                    description: "e.g., Host, Speaker, Facilitator",
                },
            ],
            ui: {
                itemProps: (item: any) => ({
                    label: item?.speaker || 'New Speaker',
                }),
            },
        },
        {
            type: "boolean",
            label: "Featured Event",
            name: "featured",
            description: "Highlight this event",
        },
    ],
};

export default Event;
