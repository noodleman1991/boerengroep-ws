import { z } from 'zod';

// Newsletter subscription validation
export const newsletterSubscriptionSchema = z.object({
    email: z
        .string()
        .min(1, 'email_required')
        .email('email_invalid')
        .max(254, 'email_too_long')
        .toLowerCase()
        .trim(),
    language: z.enum(['en', 'nl']).default('en'),
    consent: z
        .boolean()
        .refine(val => val === true, 'consent_required'),
    source: z.string().optional().default('website'),
    referrer: z.string().optional(),
});

// Unsubscribe validation
export const unsubscribeSchema = z.object({
    token: z
        .string()
        .min(1, 'token_required')
        .uuid('token_invalid'),
    reason: z.string().optional(),
    feedback: z.string().max(1000, 'feedback_too_long').optional(),
});

// Email verification validation
export const emailVerificationSchema = z.object({
    token: z
        .string()
        .min(1, 'token_required')
        .uuid('token_invalid'),
});

// Data export request validation
export const dataExportSchema = z.object({
    email: z
        .string()
        .min(1, 'email_required')
        .email('email_invalid')
        .toLowerCase()
        .trim(),
    language: z.enum(['en', 'nl']).default('en'),
});

// Data deletion request validation
export const dataDeletionSchema = z.object({
    email: z
        .string()
        .min(1, 'email_required')
        .email('email_invalid')
        .toLowerCase()
        .trim(),
    confirmation: z
        .boolean()
        .refine(val => val === true, 'confirmation_required'),
    reason: z.string().max(1000, 'reason_too_long').optional(),
});

// Update preferences validation
export const updatePreferencesSchema = z.object({
    token: z
        .string()
        .min(1, 'token_required')
        .uuid('token_invalid'),
    language: z.enum(['en', 'nl']),
});

// Server-side validation for API routes
export const apiRequestSchema = z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    timestamp: z.date().optional().default(() => new Date()),
});

// Combined schemas for API endpoints
export const subscribeApiSchema = newsletterSubscriptionSchema.merge(apiRequestSchema);
export const unsubscribeApiSchema = unsubscribeSchema.merge(apiRequestSchema);
export const verifyApiSchema = emailVerificationSchema.merge(apiRequestSchema);
export const exportApiSchema = dataExportSchema.merge(apiRequestSchema);
export const deleteApiSchema = dataDeletionSchema.merge(apiRequestSchema);

// Type exports for TypeScript
export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
export type UnsubscribeRequest = z.infer<typeof unsubscribeSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
export type DataExportRequest = z.infer<typeof dataExportSchema>;
export type DataDeletionRequest = z.infer<typeof dataDeletionSchema>;
export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>;

// Validation error messages mapping
export const validationMessages = {
    en: {
        email_required: 'Email address is required',
        email_invalid: 'Please enter a valid email address',
        email_too_long: 'Email address is too long',
        consent_required: 'You must consent to receive newsletters',
        token_required: 'Token is required',
        token_invalid: 'Invalid or expired token',
        confirmation_required: 'You must confirm this action',
        feedback_too_long: 'Feedback is too long (maximum 1000 characters)',
        reason_too_long: 'Reason is too long (maximum 1000 characters)',
    },
    nl: {
        email_required: 'E-mailadres is verplicht',
        email_invalid: 'Voer een geldig e-mailadres in',
        email_too_long: 'E-mailadres is te lang',
        consent_required: 'Je moet toestemming geven om nieuwsbrieven te ontvangen',
        token_required: 'Token is verplicht',
        token_invalid: 'Ongeldige of verlopen token',
        confirmation_required: 'Je moet deze actie bevestigen',
        feedback_too_long: 'Feedback is te lang (maximaal 1000 tekens)',
        reason_too_long: 'Reden is te lang (maximaal 1000 tekens)',
    },
} as const;
