import { defineConfig } from "tinacms";
import baseConfig from "../next.config.base";

import Post from "./collection/post";
import Global from "./collection/global";
import Author from "./collection/author";
import Page from "./collection/page";
import Tag from "./collection/tag";
import Event from "./collection/event";
import Speaker from "./collection/speaker";
import Vacancy from "./collection/vacancy";
import Newsletter from "./collection/newsletter";

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
        //basePath: baseConfig.basePath?.replace(/^\//, '') || '',
    },
    schema: {
        collections: [Event, Page, Tag,  Speaker, Vacancy, Newsletter, Global, Post, Author],
    },
});

export default config;

