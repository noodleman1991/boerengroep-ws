// import type { Collection } from "@tinacms/cli";
// import { ColorPickerInput } from "../fields/color";
// import { iconSchema } from "../fields/icon";
//
// const Global: Collection = {
//     label: "Global",
//     name: "global",
//     path: "content/global",
//     format: "json",
//     ui: {
//         global: true,
//     },
//     fields: [
//         {
//             type: "object",
//             label: "Header",
//             name: "header",
//             fields: [
//                 iconSchema as any,
//                 {
//                     type: "string",
//                     label: "Name",
//                     name: "name",
//                 },
//                 {
//                     type: "string",
//                     label: "Color",
//                     name: "color",
//                     options: [
//                         { label: "Default", value: "default" },
//                         { label: "Primary", value: "primary" },
//                     ],
//                 },
//                 {
//                     type: "object",
//                     label: "Navigation Links",
//                     name: "nav",
//                     list: true,
//                     ui: {
//                         itemProps: (item: any) => {
//                             return { label: item?.label };
//                         },
//                         defaultItem: {
//                             href: "/",
//                             label: "Home",
//                         },
//                     },
//                     fields: [
//                         {
//                             type: "string",
//                             label: "Link",
//                             name: "href",
//                         },
//                         {
//                             type: "string",
//                             label: "Label",
//                             name: "label",
//                         },
//                         {
//                             type: "object",
//                             label: "Submenu Items",
//                             name: "submenu",
//                             list: true,
//                             ui: {
//                                 itemProps: (item: any) => {
//                                     return { label: item?.label };
//                                 },
//                                 defaultItem: {
//                                     href: "/",
//                                     label: "Submenu Item",
//                                 },
//                             },
//                             fields: [
//                                 {
//                                     type: "string",
//                                     label: "Link",
//                                     name: "href",
//                                 },
//                                 {
//                                     type: "string",
//                                     label: "Label",
//                                     name: "label",
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//         },
//         {
//             type: "object",
//             label: "Footer",
//             name: "footer",
//             fields: [
//                 {
//                     type: "object",
//                     label: "Social Links",
//                     name: "social",
//                     list: true,
//                     ui: {
//                         itemProps: (item: any) => {
//                             return { label: item?.icon?.name || 'undefined' };
//                         },
//                     },
//                     fields: [
//                         iconSchema as any,
//                         {
//                             type: "string",
//                             label: "Url",
//                             name: "url",
//                         },
//                     ],
//                 },
//                 {
//                     type: "object",
//                     label: "Quick Links Sections",
//                     name: "quickLinks",
//                     list: true,
//                     ui: {
//                         itemProps: (item: any) => {
//                             return { label: item?.title || 'Quick Links Section' };
//                         },
//                         defaultItem: {
//                             title: "Section Title",
//                             links: [
//                                 {
//                                     href: "/",
//                                     label: "Link Label",
//                                 }
//                             ],
//                         },
//                     },
//                     fields: [
//                         {
//                             type: "string",
//                             label: "Section Title",
//                             name: "title",
//                         },
//                         {
//                             type: "object",
//                             label: "Links",
//                             name: "links",
//                             list: true,
//                             ui: {
//                                 itemProps: (item: any) => {
//                                     return { label: item?.label };
//                                 },
//                                 defaultItem: {
//                                     href: "/",
//                                     label: "Link Label",
//                                 },
//                             },
//                             fields: [
//                                 {
//                                     type: "string",
//                                     label: "Link",
//                                     name: "href",
//                                 },
//                                 {
//                                     type: "string",
//                                     label: "Label",
//                                     name: "label",
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//         },
//         {
//             type: "object",
//             label: "Theme",
//             name: "theme",
//             fields: [
//                 {
//                     type: "string",
//                     label: "Primary Color",
//                     name: "color",
//                     ui: {
//                         component: ColorPickerInput,
//                     },
//                 },
//                 {
//                     type: "string",
//                     name: "font",
//                     label: "Font Family",
//                     options: [
//                         {
//                             label: "System Sans",
//                             value: "sans",
//                         },
//                         {
//                             label: "Nunito",
//                             value: "nunito",
//                         },
//                         {
//                             label: "Lato",
//                             value: "lato",
//                         },
//                     ],
//                 },
//                 {
//                     type: "string",
//                     name: "darkMode",
//                     label: "Dark Mode",
//                     options: [
//                         {
//                             label: "System",
//                             value: "system",
//                         },
//                         {
//                             label: "Light",
//                             value: "light",
//                         },
//                         {
//                             label: "Dark",
//                             value: "dark",
//                         },
//                     ],
//                 },
//             ],
//         },
//     ],
// };
//
// export default Global;

import type { Collection } from "@tinacms/cli";
import { ColorPickerInput } from "../fields/color";

const Global: Collection = {
    label: "Global",
    name: "global",
    path: "content/global",
    format: "json",
    ui: {
        global: true,
    },
    fields: [
        {
            type: "object",
            label: "Header",
            name: "header",
            fields: [
                {
                    type: "image",
                    label: "Organization Logo",
                    name: "logo",
                    description: "Upload your organization logo (SVG recommended for best quality). Optimal size: 240x80px or similar aspect ratio.",
                    // @ts-ignore
                    uploadDir: () => "branding",
                },
                {
                    type: "string",
                    label: "Logo Alt Text",
                    name: "logoAlt",
                    description: "Alternative text for the logo (important for accessibility and SEO)",
                    required: true,
                },
                {
                    type: "string",
                    label: "Organization Name",
                    name: "name",
                    description: "Full organization name - appears in footer copyright and as fallback text",
                    required: true,
                },
                {
                    type: "string",
                    label: "Header Color Theme",
                    name: "color",
                    description: "Color theme for header elements",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Primary Brand Color", value: "primary" },
                    ],
                },
                {
                    type: "object",
                    label: "Navigation Menu",
                    name: "nav",
                    description: "Main website navigation structure",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.label || "Navigation Item" };
                        },
                        defaultItem: {
                            href: "/",
                            label: "Home",
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Link URL",
                            name: "href",
                            description: "Relative path (e.g., /about) or external URL",
                            required: true,
                        },
                        {
                            type: "string",
                            label: "Display Label",
                            name: "label",
                            description: "Text shown in navigation menu",
                            required: true,
                        },
                        {
                            type: "object",
                            label: "Dropdown Menu Items",
                            name: "submenu",
                            description: "Optional dropdown items for this navigation link",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label || "Submenu Item" };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "Submenu Item",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link URL",
                                    name: "href",
                                    required: true,
                                },
                                {
                                    type: "string",
                                    label: "Display Label",
                                    name: "label",
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Footer",
            name: "footer",
            fields: [
                {
                    type: "object",
                    label: "Social Media Links",
                    name: "social",
                    description: "Links to your organization's social media profiles",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.platform || 'Social Media Link' };
                        },
                        defaultItem: {
                            platform: "Facebook",
                            url: "https://facebook.com/your-page",
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Platform Name",
                            name: "platform",
                            description: "e.g., Facebook, Twitter, Instagram, LinkedIn",
                            required: true,
                        },
                        {
                            type: "string",
                            label: "Profile URL",
                            name: "url",
                            description: "Full URL to your profile page",
                            required: true,
                        },
                    ],
                },
                {
                    type: "object",
                    label: "Quick Links Sections",
                    name: "quickLinks",
                    description: "Organized groups of footer links",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.title || 'Quick Links Section' };
                        },
                        defaultItem: {
                            title: "about",
                            links: [
                                {
                                    href: "/about",
                                    label: "about-us",
                                },
                                {
                                    href: "/mission",
                                    label: "our-mission",
                                }
                            ],
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Section Title Key",
                            name: "title",
                            description: "Translation key for section heading (e.g., 'about', 'services')",
                            required: true,
                        },
                        {
                            type: "object",
                            label: "Section Links",
                            name: "links",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label || "Footer Link" };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "link-label",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link URL",
                                    name: "href",
                                    required: true,
                                },
                                {
                                    type: "string",
                                    label: "Translation Key",
                                    name: "label",
                                    description: "Translation key for link text",
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Brand Theme",
            name: "theme",
            description: "Global visual styling and branding settings",
            fields: [
                {
                    type: "string",
                    label: "Primary Brand Color",
                    name: "color",
                    description: "Main color used throughout the website",
                    ui: {
                        component: ColorPickerInput,
                    },
                },
                {
                    type: "string",
                    name: "font",
                    label: "Typography Family",
                    description: "Font family for website content",
                    options: [
                        {
                            label: "System Sans-Serif",
                            value: "sans",
                        },
                        {
                            label: "Nunito (Rounded)",
                            value: "nunito",
                        },
                        {
                            label: "Lato (Clean)",
                            value: "lato",
                        },
                    ],
                },
                {
                    type: "string",
                    name: "darkMode",
                    label: "Dark Mode Setting",
                    description: "How the website handles light/dark themes",
                    options: [
                        {
                            label: "Follow System Preference",
                            value: "system",
                        },
                        {
                            label: "Always Light Mode",
                            value: "light",
                        },
                        {
                            label: "Always Dark Mode",
                            value: "dark",
                        },
                    ],
                },
            ],
        },
    ],
};

export default Global;
