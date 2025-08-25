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
                    label: "Logo",
                    name: "logo",
                    description: "Upload your organization logo (SVG, PNG, or JPG recommended). Optimal size: 200x50px or similar aspect ratio.",
                    // @ts-ignore
                    uploadDir: () => "logo",
                },
                {
                    type: "string",
                    label: "Logo Alt Text",
                    name: "logoAlt",
                    description: "Alternative text for the logo (for accessibility)",
                    required: true,
                },
                {
                    type: "string",
                    label: "Organization Name",
                    name: "name",
                    description: "Will appear next to the logo as text"
                },
                {
                    type: "string",
                    label: "Color",
                    name: "color",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Primary", value: "primary" },
                    ],
                },
                {
                    type: "object",
                    label: "Navigation Links",
                    name: "nav",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.label };
                        },
                        defaultItem: {
                            href: "/",
                            label: "Home",
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Link",
                            name: "href",
                        },
                        {
                            type: "string",
                            label: "Label",
                            name: "label",
                        },
                        {
                            type: "object",
                            label: "Submenu Items",
                            name: "submenu",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "Submenu Item",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link",
                                    name: "href",
                                },
                                {
                                    type: "string",
                                    label: "Label",
                                    name: "label",
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
                // ... rest of footer fields remain the same
                {
                    type: "object",
                    label: "Social Links",
                    name: "social",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.platform || 'Social Link' };
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Platform",
                            name: "platform",
                        },
                        {
                            type: "string",
                            label: "URL",
                            name: "url",
                        },
                    ],
                },
                {
                    type: "object",
                    label: "Quick Links Sections",
                    name: "quickLinks",
                    list: true,
                    ui: {
                        itemProps: (item: any) => {
                            return { label: item?.title || 'Quick Links Section' };
                        },
                        defaultItem: {
                            title: "Section Title",
                            links: [
                                {
                                    href: "/",
                                    label: "Link Label",
                                }
                            ],
                        },
                    },
                    fields: [
                        {
                            type: "string",
                            label: "Section Title",
                            name: "title",
                        },
                        {
                            type: "object",
                            label: "Links",
                            name: "links",
                            list: true,
                            ui: {
                                itemProps: (item: any) => {
                                    return { label: item?.label };
                                },
                                defaultItem: {
                                    href: "/",
                                    label: "Link Label",
                                },
                            },
                            fields: [
                                {
                                    type: "string",
                                    label: "Link",
                                    name: "href",
                                },
                                {
                                    type: "string",
                                    label: "Label",
                                    name: "label",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Theme",
            name: "theme",
            fields: [
                {
                    type: "string",
                    label: "Primary Color",
                    name: "color",
                    ui: {
                        component: ColorPickerInput,
                    },
                },
                {
                    type: "string",
                    name: "font",
                    label: "Font Family",
                    options: [
                        {
                            label: "System Sans",
                            value: "sans",
                        },
                        {
                            label: "Nunito",
                            value: "nunito",
                        },
                        {
                            label: "Lato",
                            value: "lato",
                        },
                    ],
                },
                {
                    type: "string",
                    name: "darkMode",
                    label: "Dark Mode",
                    options: [
                        {
                            label: "System",
                            value: "system",
                        },
                        {
                            label: "Light",
                            value: "light",
                        },
                        {
                            label: "Dark",
                            value: "dark",
                        },
                    ],
                },
            ],
        },
    ],
};

export default Global;
