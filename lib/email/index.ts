import { Resend } from 'resend';
import type { SupportedLanguage } from '../db/schema';
import { getEmailTemplate } from '../db/queries';
import {
    generateVerificationUrl,
    generateUnsubscribeUrl,
    generateDataExportUrl
} from '../newsletter/utils';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_BOERENGROEP);

// Email configuration
const emailConfig = {
    from: {
        name: process.env.FROM_NAME || 'Stichting Boerengroep',
        address: process.env.FROM_EMAIL || 'newsletter@boerengroep.nl',
    },
    replyTo: process.env.REPLY_TO_EMAIL || 'info@boerengroep.nl',
};

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        // Test Resend API key by attempting to get domains
        const domains = await resend.domains.list();
        const domainCount = domains.data?.data?.length || domains.data?.length || 0;
        console.log('Resend configuration verified:', domainCount, 'domains found');
        return true;
    } catch (error) {
        console.error('Resend configuration verification failed:', error);
        return false;
    }
}

// Base email sending function
async function sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    unsubscribeToken?: string
): Promise<boolean> {
    try {
        const fromAddress = `${emailConfig.from.name} <${emailConfig.from.address}>`;

        // Add List-Unsubscribe headers for better deliverability
        const headers: Record<string, string> = {};
        if (unsubscribeToken) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const unsubscribeUrl = generateUnsubscribeUrl(unsubscribeToken, baseUrl);
            headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
            headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
        }

        const emailData = {
            from: fromAddress,
            to: [to],
            subject,
            html: htmlContent,
            text: textContent,
            replyTo: emailConfig.replyTo,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            tags: [
                { name: 'category', value: 'newsletter' },
                { name: 'environment', value: process.env.NODE_ENV || 'development' }
            ],
        };

        const result = await resend.emails.send(emailData);

        if (result.error) {
            console.error('Resend email error:', result.error);
            return false;
        }

        console.log('Email sent successfully:', result.data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

// Send welcome email with verification
export async function sendWelcomeEmail(
    email: string,
    language: SupportedLanguage,
    verificationToken: string
): Promise<boolean> {
    try {
        const template = await getEmailTemplate('welcome', language);
        if (!template) {
            console.error('Welcome email template not found');
            return false;
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const verificationUrl = generateVerificationUrl(verificationToken, baseUrl, language);

        // Replace placeholders in template
        const htmlContent = template.htmlContent
            .replace(/\{\{email\}\}/g, email)
            .replace(/\{\{verificationUrl\}\}/g, verificationUrl)
            .replace(/\{\{baseUrl\}\}/g, baseUrl);

        const textContent = template.textContent
            .replace(/\{\{email\}\}/g, email)
            .replace(/\{\{verificationUrl\}\}/g, verificationUrl)
            .replace(/\{\{baseUrl\}\}/g, baseUrl);

        return await sendEmail(email, template.subject, htmlContent, textContent);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return false;
    }
}

// Send unsubscribe confirmation
export async function sendUnsubscribeConfirmation(
    email: string,
    language: SupportedLanguage
): Promise<boolean> {
    try {
        const template = await getEmailTemplate('unsubscribe_confirm', language);
        if (!template) {
            console.error('Unsubscribe confirmation template not found');
            return false;
        }

        const htmlContent = template.htmlContent.replace(/\{\{email\}\}/g, email);
        const textContent = template.textContent.replace(/\{\{email\}\}/g, email);

        return await sendEmail(email, template.subject, htmlContent, textContent);
    } catch (error) {
        console.error('Failed to send unsubscribe confirmation:', error);
        return false;
    }
}

// Send data export email
export async function sendDataExportEmail(
    email: string,
    language: SupportedLanguage,
    exportData: any
): Promise<boolean> {
    try {
        const template = await getEmailTemplate('data_export', language);
        if (!template) {
            console.error('Data export email template not found');
            return false;
        }

        const exportJson = JSON.stringify(exportData, null, 2);
        const exportUrl = generateDataExportUrl(email, process.env.BASE_URL || 'http://localhost:3000', language);

        const htmlContent = template.htmlContent
            .replace(/\{\{email\}\}/g, email)
            .replace(/\{\{exportData\}\}/g, `<pre style="font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${exportJson}</pre>`)
            .replace(/\{\{exportUrl\}\}/g, exportUrl);

        const textContent = template.textContent
            .replace(/\{\{email\}\}/g, email)
            .replace(/\{\{exportData\}\}/g, exportJson)
            .replace(/\{\{exportUrl\}\}/g, exportUrl);

        return await sendEmail(email, template.subject, htmlContent, textContent);
    } catch (error) {
        console.error('Failed to send data export email:', error);
        return false;
    }
}

// Send newsletter email
export async function sendNewsletterEmail(
    email: string,
    language: SupportedLanguage,
    subject: string,
    content: string,
    unsubscribeToken: string
): Promise<boolean> {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const unsubscribeUrl = generateUnsubscribeUrl(unsubscribeToken, baseUrl, language);

        // Get newsletter template for wrapping content
        const template = await getEmailTemplate('newsletter', language);
        if (!template) {
            console.error('Newsletter template not found');
            return false;
        }

        const htmlContent = template.htmlContent
            .replace(/\{\{subject\}\}/g, subject)
            .replace(/\{\{content\}\}/g, content)
            .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)
            .replace(/\{\{email\}\}/g, email);

        const textContent = template.textContent
            .replace(/\{\{subject\}\}/g, subject)
            .replace(/\{\{content\}\}/g, content.replace(/<[^>]*>/g, '')) // Strip HTML for text version
            .replace(/\{\{unsubscribeUrl\}\}/g, unsubscribeUrl)
            .replace(/\{\{email\}\}/g, email);

        return await sendEmail(email, subject, htmlContent, textContent, unsubscribeToken);
    } catch (error) {
        console.error('Failed to send newsletter email:', error);
        return false;
    }
}

// Test email functionality
export async function sendTestEmail(email: string): Promise<boolean> {
    try {
        const subject = 'Newsletter System Test - Stichting Boerengroep';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1>Newsletter System Test</h1>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
                    <p>Hello!</p>
                    <p>This is a test email to verify that the newsletter system is working correctly with Resend.</p>
                    <div style="background-color: #e7f3f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #059669;">System Information:</h3>
                        <ul style="margin: 0; color: #666;">
                            <li>Email Service: Resend</li>
                            <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
                            <li>Sent at: ${new Date().toISOString()}</li>
                            <li>From: ${emailConfig.from.name} &lt;${emailConfig.from.address}&gt;</li>
                        </ul>
                    </div>
                    <p>If you received this email, the newsletter system is configured correctly!</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                        <p>This is a test email from the Stichting Boerengroep newsletter system.</p>
                    </div>
                </div>
            </div>
        `;
        const textContent = `
Newsletter System Test - Stichting Boerengroep

Hello!

This is a test email to verify that the newsletter system is working correctly with Resend.

System Information:
- Email Service: Resend
- Environment: ${process.env.NODE_ENV || 'development'}
- Sent at: ${new Date().toISOString()}
- From: ${emailConfig.from.name} <${emailConfig.from.address}>

If you received this email, the newsletter system is configured correctly!

This is a test email from the Stichting Boerengroep newsletter system.
        `;

        return await sendEmail(email, subject, htmlContent, textContent);
    } catch (error) {
        console.error('Failed to send test email:', error);
        return false;
    }
}

// Batch send newsletters (for when you want to send to multiple subscribers)
export async function sendBatchNewsletters(
    subscribers: Array<{ email: string; language: SupportedLanguage; unsubscribeToken: string }>,
    subject: string,
    content: string
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Send in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);

        const promises = batch.map(async (subscriber) => {
            try {
                const success = await sendNewsletterEmail(
                    subscriber.email,
                    subscriber.language,
                    subject,
                    content,
                    subscriber.unsubscribeToken
                );
                return success;
            } catch (error) {
                console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
                return false;
            }
        });

        const results = await Promise.all(promises);
        sent += results.filter(Boolean).length;
        failed += results.filter(r => !r).length;

        // Add delay between batches to respect rate limits
        if (i + batchSize < subscribers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return { sent, failed };
}
