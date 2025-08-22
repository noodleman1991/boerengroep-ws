import 'dotenv/config'; // Load environment variables
import { db } from '../lib/db';
import { emailTemplates, gdprMessages } from '../lib/db/schema';
import { defaultTemplates } from '../lib/email/templates';

const seedGdprMessages = [
    {
        messageKey: 'consent_text',
        language: 'en' as const,
        content: 'I consent to receive newsletters from Stichting Boerengroep. You can unsubscribe at any time.',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        messageKey: 'consent_text',
        language: 'nl' as const,
        content: 'Ik ga akkoord met het ontvangen van nieuwsbrieven van Stichting Boerengroep. Je kunt je op elk moment uitschrijven.',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        messageKey: 'privacy_policy_link',
        language: 'en' as const,
        content: 'Read our Privacy Policy',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        messageKey: 'privacy_policy_link',
        language: 'nl' as const,
        content: 'Lees ons Privacybeleid',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

async function seedDatabase() {
    console.log('🌱 Seeding newsletter system...');

    try {
        // Insert email templates
        console.log('📧 Inserting email templates...');
        for (const template of defaultTemplates) {
            await db.insert(emailTemplates).values(template).onConflictDoNothing();
        }
        console.log('✅ Email templates seeded');

        // Insert GDPR messages
        console.log('📋 Inserting GDPR messages...');
        for (const message of seedGdprMessages) {
            await db.insert(gdprMessages).values(message).onConflictDoNothing();
        }
        console.log('✅ GDPR messages seeded');

        console.log('🎉 Newsletter system seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
