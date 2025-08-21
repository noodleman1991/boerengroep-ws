import type { Collection } from "@tinacms/cli";

const Vacancy: Collection = {
    label: "Vacancies",
    name: "vacancy",
    path: "content/vacancies",
    format: "mdx",
    ui: {
        router: ({ document }: any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                return `/${locale}/vacancies`;
            } else {
                return `/nl/vacancies`;
            }
        },
    },
    fields: [
        {
            type: "string",
            label: "Type of Opportunity",
            name: "opportunityType",
            required: true,
            description: "Select the main category of opportunity",
            options: [
                { label: "Volunteer", value: "volunteer" },
                { label: "Internship", value: "internship" },
                { label: "Coordinator", value: "coordinator" },
                { label: "Freelance or Temporary", value: "freelance" },
                { label: "Other", value: "other" },
            ],
        },
        {
            type: "string",
            label: "Title of Position",
            name: "title",
            isTitle: true,
            required: true,
        },
        {
            type: "object",
            label: "Job Location",
            name: "location",
            fields: [
                {
                    type: "string",
                    label: "Type",
                    name: "type",
                    options: [
                        { label: "Remote", value: "remote" },
                        { label: "In-person", value: "in-person" },
                        { label: "Hybrid", value: "hybrid" },
                    ],
                },
                {
                    type: "string",
                    label: "Where?",
                    name: "cityRegion",
                },
            ],
        },
        {
            type: "datetime",
            label: "Start Date",
            name: "startDate",
            ui: {
                dateFormat: "YYYY-MM-DD",
            },
        },
        {
            type: "string",
            label: "Duration",
            name: "duration",
            description: "e.g., 3 months, 1 year",
        },
        {
            type: "datetime",
            label: "Application Deadline",
            name: "applicationDeadline",
            required: true,
            ui: {
                dateFormat: "YYYY-MM-DD",
            },
        },
        {
            type: "rich-text",
            label: "Description",
            name: "description",
            description: "What it is, why it matters",
        },
        {
            type: "rich-text",
            label: "Responsibilities",
            name: "responsibilities",
            description: "Bulleted list or short paragraph",
        },
        {
            type: "string",
            label: "Required Skills or Experience",
            name: "requiredSkills",
            list: true,
            ui: {
                component: "tags",
            },
        },
        {
            type: "rich-text",
            label: "Preferred Qualities",
            name: "preferredQualities",
            description: "Bulleted list or short paragraph",
        },
        {
            type: "string",
            label: "Languages Required",
            name: "languagesRequired",
            list: true,
            ui: {
                component: "tags",
            },
        },
        {
            type: "object",
            label: "Compensation",
            name: "compensation",
            fields: [
                {
                    type: "string",
                    label: "Compensation Details",
                    name: "details",
                    description: "e.g., €3000/month salary, €15/hour, €500 stipend, Unpaid volunteer position, Travel reimbursement only",
                    ui: {
                        component: "textarea",
                    },
                },
            ],
        },
        {
            type: "string",
            label: "Accessibility Notes",
            name: "accessibilityNotes",
            ui: {
                component: "textarea",
            },
        },
        {
            type: "rich-text",
            label: "How to Apply",
            name: "howToApply",
            description: "Instructions or link",
        },
        {
            type: "object",
            label: "Contact Info",
            name: "contactInfo",
            fields: [
                {
                    type: "string",
                    label: "Contact Name",
                    name: "name",
                },
                {
                    type: "string",
                    label: "Email",
                    name: "email",
                },
                {
                    type: "string",
                    label: "Phone",
                    name: "phone",
                },
            ],
        },
        {
            type: "image",
            label: "Job Description",
            name: "supportingDocument",
            description: "Upload PDF or DOCX file (job description, flyer, etc.)",
            // @ts-ignore
            uploadDir: () => "vacancies/documents",
        },
        {
            type: "rich-text",
            label: "Values Alignment Statement",
            name: "valuesStatement",
            description: "DEI commitment, land acknowledgement, etc.",
        },
        {
            type: "boolean",
            label: "Open to Nontraditional Applicants",
            name: "openToNontraditional",
        },
    ],
};

export default Vacancy;
