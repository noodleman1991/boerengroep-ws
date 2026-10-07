import { z } from "zod";

export const eventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z.date({
        message: "Start date is required", // Changed from required_error
    }),
    endDate: z.date({
        message: "End date is required", // Changed from required_error
    }),
    color: z.enum(["blue", "green", "red", "yellow", "purple", "orange", "pink", "teal"], {
        message: "Variant is required", // Changed from required_error
    }),
});

export type TEventFormData = z.infer<typeof eventSchema>;
