import type { Collection } from "@tinacms/cli";

/**
 * Redirect Collection
 *
 * Manages URL redirects for the website. Use this to:
 * - Redirect old URLs when page slugs change
 * - Create short URLs that redirect to longer paths
 * - Handle renamed or moved pages
 *
 * Redirects are applied at build time via Next.js config.
 */
const Redirect: Collection = {
    label: "Redirects",
    name: "redirect",
    path: "content/redirects",
    format: "json",
    ui: {
        allowedActions: {
            create: true,
            delete: true,
        },
        filename: {
            slugify: (values: any) => {
                // Generate filename from the 'from' path
                const from = values?.from || 'redirect';
                return from
                    .replace(/^\//, '') // Remove leading slash
                    .replace(/\//g, '-') // Replace slashes with dashes
                    .replace(/[^a-z0-9-]/gi, '') // Remove special chars
                    .toLowerCase()
                    || 'redirect';
            },
        },
    },
    fields: [
        {
            type: "string",
            name: "from",
            label: "From URL",
            description: "The old URL path to redirect from (e.g., /old-page or /en/old-page). Do not include the domain.",
            required: true,
            ui: {
                validate: (value: string) => {
                    if (!value) return "From URL is required";
                    if (!value.startsWith('/')) return "URL must start with /";
                    return undefined;
                },
            },
        },
        {
            type: "string",
            name: "to",
            label: "To URL",
            description: "The new URL path to redirect to (e.g., /new-page). Can be a relative path or full URL for external redirects.",
            required: true,
            ui: {
                validate: (value: string) => {
                    if (!value) return "To URL is required";
                    if (!value.startsWith('/') && !value.startsWith('http')) {
                        return "URL must start with / or http(s)://";
                    }
                    return undefined;
                },
            },
        },
        {
            type: "boolean",
            name: "permanent",
            label: "Permanent Redirect (301)",
            description: "Check for permanent redirects (301). Uncheck for temporary redirects (302). Use permanent for moved/renamed pages.",
            // @ts-ignore - TinaCMS supports default values
            ui: {
                component: "toggle",
            },
        },
        {
            type: "string",
            name: "note",
            label: "Note",
            description: "Optional note explaining why this redirect exists (for reference only)",
        },
    ],
};

export default Redirect;
