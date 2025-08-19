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
            overrides: {
                toolbar: ['bold', 'italic', 'link'],
            },
        },
    ],
};

export default Speaker;
