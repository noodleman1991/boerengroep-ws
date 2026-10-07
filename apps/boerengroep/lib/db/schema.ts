import { pgTable, uuid, text, timestamp, inet, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums for better type safety
export const languageEnum = pgEnum('language', ['en', 'nl']);
export const statusEnum = pgEnum('status', ['pending', 'active', 'unsubscribed', 'bounced']);
export const actionEnum = pgEnum('action', ['subscribe', 'unsubscribe', 'update', 'export', 'delete']);
export const templateTypeEnum = pgEnum('template_type', ['welcome', 'newsletter', 'unsubscribe_confirm', 'data_export']);

export const subscribers = pgTable('subscribers', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    preferredLanguage: languageEnum('preferred_language').default('en').notNull(),
    subscribedDate: timestamp('subscribed_date').defaultNow().notNull(),
    consentTimestamp: timestamp('consent_timestamp').notNull(),
    consentIp: inet('consent_ip'),
    consentUserAgent: text('consent_user_agent'),
    status: statusEnum('status').default('pending').notNull(),
    unsubscribeToken: uuid('unsubscribe_token').unique().defaultRandom().notNull(),
    verificationToken: uuid('verification_token').unique().defaultRandom(),
    verifiedAt: timestamp('verified_at'),
    lastEmailSent: timestamp('last_email_sent'),
    emailCount: text('email_count').default('0').notNull(),
    bounceCount: text('bounce_count').default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const consentLogs = pgTable('consent_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    action: actionEnum('action').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    language: languageEnum('language').notNull(),
    details: text('details'), // JSON string for additional context
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailTemplates = pgTable('email_templates', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: templateTypeEnum('type').notNull(),
    language: languageEnum('language').notNull(),
    subject: text('subject').notNull(),
    htmlContent: text('html_content').notNull(),
    textContent: text('text_content').notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gdprMessages = pgTable('gdpr_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    messageKey: text('message_key').notNull(),
    language: languageEnum('language').notNull(),
    content: text('content').notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types for TypeScript inference
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type ConsentLog = typeof consentLogs.$inferSelect;
export type NewConsentLog = typeof consentLogs.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type GdprMessage = typeof gdprMessages.$inferSelect;
export type NewGdprMessage = typeof gdprMessages.$inferInsert;

// Utility types for frontend
export type SubscriberStatus = typeof statusEnum.enumValues[number];
export type SupportedLanguage = typeof languageEnum.enumValues[number];
export type ConsentAction = typeof actionEnum.enumValues[number];
export type TemplateType = typeof templateTypeEnum.enumValues[number];
