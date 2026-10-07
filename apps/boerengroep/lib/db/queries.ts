import { eq, and, desc } from 'drizzle-orm';
import { db } from './index';
import {
    subscribers,
    consentLogs,
    emailTemplates,
    gdprMessages,
    type Subscriber,
    type NewSubscriber,
    type NewConsentLog,
    type SupportedLanguage,
    type SubscriberStatus,
    type TemplateType
} from './schema';

// Subscriber queries
export async function createSubscriber(data: NewSubscriber): Promise<Subscriber | null> {
    try {
        const [subscriber] = await db.insert(subscribers).values(data).returning();
        return subscriber || null;
    } catch (error) {
        console.error('Error creating subscriber:', error);
        return null;
    }
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    try {
        const [subscriber] = await db
            .select()
            .from(subscribers)
            .where(eq(subscribers.email, email))
            .limit(1);
        return subscriber || null;
    } catch (error) {
        console.error('Error getting subscriber by email:', error);
        return null;
    }
}

export async function getSubscriberByToken(token: string, tokenType: 'unsubscribe' | 'verification'): Promise<Subscriber | null> {
    try {
        const column = tokenType === 'unsubscribe' ? subscribers.unsubscribeToken : subscribers.verificationToken;
        const [subscriber] = await db
            .select()
            .from(subscribers)
            .where(eq(column, token))
            .limit(1);
        return subscriber || null;
    } catch (error) {
        console.error(`Error getting subscriber by ${tokenType} token:`, error);
        return null;
    }
}

export async function updateSubscriberStatus(
    email: string,
    status: SubscriberStatus,
    additionalFields: Partial<Subscriber> = {}
): Promise<boolean> {
    try {
        await db
            .update(subscribers)
            .set({
                status,
                updatedAt: new Date(),
                ...additionalFields
            })
            .where(eq(subscribers.email, email));
        return true;
    } catch (error) {
        console.error('Error updating subscriber status:', error);
        return false;
    }
}

export async function deleteSubscriber(email: string): Promise<boolean> {
    try {
        await db.delete(subscribers).where(eq(subscribers.email, email));
        return true;
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return false;
    }
}

export async function getActiveSubscribers(language?: SupportedLanguage): Promise<Subscriber[]> {
    try {
        const conditions = [eq(subscribers.status, 'active')];
        if (language) {
            conditions.push(eq(subscribers.preferredLanguage, language));
        }

        const activeSubscribers = await db
            .select()
            .from(subscribers)
            .where(and(...conditions))
            .orderBy(desc(subscribers.subscribedDate));

        return activeSubscribers;
    } catch (error) {
        console.error('Error getting active subscribers:', error);
        return [];
    }
}

// Consent log queries
export async function logConsent(data: NewConsentLog): Promise<boolean> {
    try {
        await db.insert(consentLogs).values(data);
        return true;
    } catch (error) {
        console.error('Error logging consent:', error);
        return false;
    }
}

export async function getConsentHistory(email: string): Promise<typeof consentLogs.$inferSelect[]> {
    try {
        const history = await db
            .select()
            .from(consentLogs)
            .where(eq(consentLogs.email, email))
            .orderBy(desc(consentLogs.timestamp));

        return history;
    } catch (error) {
        console.error('Error getting consent history:', error);
        return [];
    }
}

// Email template queries
export async function getEmailTemplate(
    type: TemplateType,
    language: SupportedLanguage
): Promise<typeof emailTemplates.$inferSelect | null> {
    try {
        const [template] = await db
            .select()
            .from(emailTemplates)
            .where(
                and(
                    eq(emailTemplates.type, type),
                    eq(emailTemplates.language, language),
                    eq(emailTemplates.active, true)
                )
            )
            .limit(1);

        return template || null;
    } catch (error) {
        console.error('Error getting email template:', error);
        return null;
    }
}

// GDPR message queries
export async function getGdprMessage(
    messageKey: string,
    language: SupportedLanguage
): Promise<string | null> {
    try {
        const [message] = await db
            .select()
            .from(gdprMessages)
            .where(
                and(
                    eq(gdprMessages.messageKey, messageKey),
                    eq(gdprMessages.language, language),
                    eq(gdprMessages.active, true)
                )
            )
            .limit(1);

        return message?.content || null;
    } catch (error) {
        console.error('Error getting GDPR message:', error);
        return null;
    }
}

// Analytics queries
export async function getSubscriberStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    unsubscribed: number;
    byLanguage: Record<SupportedLanguage, number>;
}> {
    try {
        const allSubscribers = await db.select().from(subscribers);

        const stats = {
            total: allSubscribers.length,
            active: allSubscribers.filter(s => s.status === 'active').length,
            pending: allSubscribers.filter(s => s.status === 'pending').length,
            unsubscribed: allSubscribers.filter(s => s.status === 'unsubscribed').length,
            byLanguage: {
                en: allSubscribers.filter(s => s.preferredLanguage === 'en').length,
                nl: allSubscribers.filter(s => s.preferredLanguage === 'nl').length,
            } as Record<SupportedLanguage, number>
        };

        return stats;
    } catch (error) {
        console.error('Error getting subscriber stats:', error);
        return {
            total: 0,
            active: 0,
            pending: 0,
            unsubscribed: 0,
            byLanguage: { en: 0, nl: 0 }
        };
    }
}
