import type { NewEmailTemplate, SupportedLanguage } from '../db/schema';

// Base template styles
const baseStyles = `
<style>
    body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        max-width: 600px; 
        margin: 0 auto; 
        padding: 20px; 
    }
    .header { 
        background-color: #059669; 
        color: white; 
        padding: 20px; 
        text-align: center; 
        border-radius: 8px 8px 0 0; 
    }
    .content { 
        background-color: #f9f9f9; 
        padding: 20px; 
        border-radius: 0 0 8px 8px; 
    }
    .button { 
        display: inline-block; 
        padding: 12px 24px; 
        background-color: #059669; 
        color: white; 
        text-decoration: none; 
        border-radius: 4px; 
        margin: 10px 0; 
    }
    .footer { 
        margin-top: 20px; 
        padding-top: 20px; 
        border-top: 1px solid #ddd; 
        font-size: 12px; 
        color: #666; 
    }
    .unsubscribe { 
        text-align: center; 
        margin-top: 20px; 
        font-size: 12px; 
    }
</style>
`;

// Default email templates
export const defaultTemplates: NewEmailTemplate[] = [
    // English Welcome Template
    {
        type: 'welcome',
        language: 'en',
        subject: 'Welcome to Stichting Boerengroep Newsletter',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Welcome to Our Newsletter!</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for subscribing to the Stichting Boerengroep newsletter. We're excited to keep you updated on sustainable agriculture, our activities, and community initiatives.</p>
                
                <p><strong>Please verify your email address to complete your subscription:</strong></p>
                <p><a href="{{verificationUrl}}" class="button">Verify Email Address</a></p>
                
                <p>If the button doesn't work, copy and paste this link into your browser:<br>
                {{verificationUrl}}</p>
                
                <div class="footer">
                    <p><strong>What you can expect:</strong></p>
                    <ul>
                        <li>Monthly updates on our activities and events</li>
                        <li>News about sustainable agriculture and food systems</li>
                        <li>Information about workshops and educational opportunities</li>
                        <li>Community stories and initiatives</li>
                    </ul>
                    
                    <p><strong>Your Privacy Matters:</strong><br>
                    We respect your privacy and will only use your email address to send you our newsletter. 
                    You can unsubscribe at any time using the link in our emails. 
                    We never share your information with third parties.</p>
                    
                    <p>If you have any questions, please contact us at info@boerengroep.nl</p>
                </div>
            </div>
            <div class="unsubscribe">
                <p>If you didn't sign up for this newsletter, you can safely ignore this email.</p>
            </div>
        `,
        textContent: `
Welcome to Stichting Boerengroep Newsletter!

Hello,

Thank you for subscribing to the Stichting Boerengroep newsletter. We're excited to keep you updated on sustainable agriculture, our activities, and community initiatives.

Please verify your email address to complete your subscription:
{{verificationUrl}}

What you can expect:
- Monthly updates on our activities and events
- News about sustainable agriculture and food systems
- Information about workshops and educational opportunities
- Community stories and initiatives

Your Privacy Matters:
We respect your privacy and will only use your email address to send you our newsletter. You can unsubscribe at any time using the link in our emails. We never share your information with third parties.

If you have any questions, please contact us at info@boerengroep.nl

If you didn't sign up for this newsletter, you can safely ignore this email.
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Dutch Welcome Template
    {
        type: 'welcome',
        language: 'nl',
        subject: 'Welkom bij de Stichting Boerengroep Nieuwsbrief',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Welkom bij onze Nieuwsbrief!</h1>
            </div>
            <div class="content">
                <p>Hallo,</p>
                <p>Bedankt voor je inschrijving op de Stichting Boerengroep nieuwsbrief. We zijn blij je op de hoogte te kunnen houden van duurzame landbouw, onze activiteiten en gemeenschapsinitiatieven.</p>
                
                <p><strong>Verifieer je e-mailadres om je inschrijving te voltooien:</strong></p>
                <p><a href="{{verificationUrl}}" class="button">E-mailadres Verifiëren</a></p>
                
                <p>Als de knop niet werkt, kopieer en plak deze link in je browser:<br>
                {{verificationUrl}}</p>
                
                <div class="footer">
                    <p><strong>Wat je kunt verwachten:</strong></p>
                    <ul>
                        <li>Maandelijkse updates over onze activiteiten en evenementen</li>
                        <li>Nieuws over duurzame landbouw en voedselsystemen</li>
                        <li>Informatie over workshops en educatieve mogelijkheden</li>
                        <li>Verhalen en initiatieven uit de gemeenschap</li>
                    </ul>
                    
                    <p><strong>Je Privacy is Belangrijk:</strong><br>
                    We respecteren je privacy en gebruiken je e-mailadres alleen om je onze nieuwsbrief te sturen. 
                    Je kunt je op elk moment uitschrijven via de link in onze e-mails. 
                    We delen je informatie nooit met derden.</p>
                    
                    <p>Bij vragen kun je contact opnemen via info@boerengroep.nl</p>
                </div>
            </div>
            <div class="unsubscribe">
                <p>Als je je niet hebt ingeschreven voor deze nieuwsbrief, kun je deze e-mail negeren.</p>
            </div>
        `,
        textContent: `
Welkom bij de Stichting Boerengroep Nieuwsbrief!

Hallo,

Bedankt voor je inschrijving op de Stichting Boerengroep nieuwsbrief. We zijn blij je op de hoogte te kunnen houden van duurzame landbouw, onze activiteiten en gemeenschapsinitiatieven.

Verifieer je e-mailadres om je inschrijving te voltooien:
{{verificationUrl}}

Wat je kunt verwachten:
- Maandelijkse updates over onze activiteiten en evenementen
- Nieuws over duurzame landbouw en voedselsystemen
- Informatie over workshops en educatieve mogelijkheden
- Verhalen en initiatieven uit de gemeenschap

Je Privacy is Belangrijk:
We respecteren je privacy en gebruiken je e-mailadres alleen om je onze nieuwsbrief te sturen. Je kunt je op elk moment uitschrijven via de link in onze e-mails. We delen je informatie nooit met derden.

Bij vragen kun je contact opnemen via info@boerengroep.nl

Als je je niet hebt ingeschreven voor deze nieuwsbrief, kun je deze e-mail negeren.
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Newsletter Template (English)
    {
        type: 'newsletter',
        language: 'en',
        subject: '{{subject}}',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Stichting Boerengroep Newsletter</h1>
            </div>
            <div class="content">
                {{content}}
                
                <div class="footer">
                    <p>Thank you for reading our newsletter!</p>
                    <p>Visit our website: <a href="https://boerengroep.nl">www.boerengroep.nl</a></p>
                </div>
            </div>
            <div class="unsubscribe">
                <p>You received this email because you subscribed to our newsletter.</p>
                <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="https://boerengroep.nl/privacy">Privacy Policy</a></p>
            </div>
        `,
        textContent: `
Stichting Boerengroep Newsletter

{{content}}

Thank you for reading our newsletter!
Visit our website: https://boerengroep.nl

You received this email because you subscribed to our newsletter.
Unsubscribe: {{unsubscribeUrl}}
Privacy Policy: https://boerengroep.nl/privacy
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Newsletter Template (Dutch)
    {
        type: 'newsletter',
        language: 'nl',
        subject: '{{subject}}',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Stichting Boerengroep Nieuwsbrief</h1>
            </div>
            <div class="content">
                {{content}}
                
                <div class="footer">
                    <p>Bedankt voor het lezen van onze nieuwsbrief!</p>
                    <p>Bezoek onze website: <a href="https://boerengroep.nl">www.boerengroep.nl</a></p>
                </div>
            </div>
            <div class="unsubscribe">
                <p>Je ontvangt deze e-mail omdat je je hebt ingeschreven voor onze nieuwsbrief.</p>
                <p><a href="{{unsubscribeUrl}}">Uitschrijven</a> | <a href="https://boerengroep.nl/privacy">Privacybeleid</a></p>
            </div>
        `,
        textContent: `
Stichting Boerengroep Nieuwsbrief

{{content}}

Bedankt voor het lezen van onze nieuwsbrief!
Bezoek onze website: https://boerengroep.nl

Je ontvangt deze e-mail omdat je je hebt ingeschreven voor onze nieuwsbrief.
Uitschrijven: {{unsubscribeUrl}}
Privacybeleid: https://boerengroep.nl/privacy
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Unsubscribe Confirmation (English)
    {
        type: 'unsubscribe_confirm',
        language: 'en',
        subject: 'Unsubscribed from Stichting Boerengroep Newsletter',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Unsubscription Confirmed</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We have successfully unsubscribed {{email}} from the Stichting Boerengroep newsletter.</p>
                <p>We're sorry to see you go and hope our paths cross again in the future.</p>
                
                <p>If you unsubscribed by mistake, you can <a href="https://boerengroep.nl/newsletter">re-subscribe here</a>.</p>
                
                <div class="footer">
                    <p>Thank you for your support of sustainable agriculture and our mission.</p>
                    <p>Visit our website: <a href="https://boerengroep.nl">www.boerengroep.nl</a></p>
                </div>
            </div>
        `,
        textContent: `
Unsubscription Confirmed

Hello,

We have successfully unsubscribed {{email}} from the Stichting Boerengroep newsletter.

We're sorry to see you go and hope our paths cross again in the future.

If you unsubscribed by mistake, you can re-subscribe here: https://boerengroep.nl/newsletter

Thank you for your support of sustainable agriculture and our mission.
Visit our website: https://boerengroep.nl
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Unsubscribe Confirmation (Dutch)
    {
        type: 'unsubscribe_confirm',
        language: 'nl',
        subject: 'Uitgeschreven van Stichting Boerengroep Nieuwsbrief',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Uitschrijving Bevestigd</h1>
            </div>
            <div class="content">
                <p>Hallo,</p>
                <p>We hebben {{email}} succesvol uitgeschreven van de Stichting Boerengroep nieuwsbrief.</p>
                <p>We vinden het jammer dat je gaat en hopen dat onze wegen in de toekomst weer kruisen.</p>
                
                <p>Als je per ongeluk uitgeschreven bent, kun je je <a href="https://boerengroep.nl/nieuwsbrief">hier opnieuw inschrijven</a>.</p>
                
                <div class="footer">
                    <p>Bedankt voor je steun aan duurzame landbouw en onze missie.</p>
                    <p>Bezoek onze website: <a href="https://boerengroep.nl">www.boerengroep.nl</a></p>
                </div>
            </div>
        `,
        textContent: `
Uitschrijving Bevestigd

Hallo,

We hebben {{email}} succesvol uitgeschreven van de Stichting Boerengroep nieuwsbrief.

We vinden het jammer dat je gaat en hopen dat onze wegen in de toekomst weer kruisen.

Als je per ongeluk uitgeschreven bent, kun je je hier opnieuw inschrijven: https://boerengroep.nl/nieuwsbrief

Bedankt voor je steun aan duurzame landbouw en onze missie.
Bezoek onze website: https://boerengroep.nl
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Data Export Template (English)
    {
        type: 'data_export',
        language: 'en',
        subject: 'Your Data Export from Stichting Boerengroep',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Your Data Export</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>As requested, here is the data we have stored for {{email}}:</p>
                
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <pre style="white-space: pre-wrap; font-size: 12px;">{{exportData}}</pre>
                </div>
                
                <p>This export includes:</p>
                <ul>
                    <li>Your subscription information</li>
                    <li>Consent history and timestamps</li>
                    <li>Email preferences</li>
                    <li>Subscription statistics</li>
                </ul>
                
                <div class="footer">
                    <p><strong>GDPR Information:</strong><br>
                    This data export was generated in compliance with GDPR Article 15 (Right of Access). 
                    If you have questions about this data or wish to request its deletion, 
                    please contact us at privacy@boerengroep.nl</p>
                </div>
            </div>
        `,
        textContent: `
Your Data Export from Stichting Boerengroep

Hello,

As requested, here is the data we have stored for {{email}}:

{{exportData}}

This export includes:
- Your subscription information
- Consent history and timestamps
- Email preferences
- Subscription statistics

GDPR Information:
This data export was generated in compliance with GDPR Article 15 (Right of Access). If you have questions about this data or wish to request its deletion, please contact us at privacy@boerengroep.nl
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Data Export Template (Dutch)
    {
        type: 'data_export',
        language: 'nl',
        subject: 'Je Data Export van Stichting Boerengroep',
        htmlContent: `
            ${baseStyles}
            <div class="header">
                <h1>Je Data Export</h1>
            </div>
            <div class="content">
                <p>Hallo,</p>
                <p>Zoals gevraagd, hier is de data die we hebben opgeslagen voor {{email}}:</p>
                
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <pre style="white-space: pre-wrap; font-size: 12px;">{{exportData}}</pre>
                </div>
                
                <p>Deze export bevat:</p>
                <ul>
                    <li>Je inschrijvingsinformatie</li>
                    <li>Toestemmingsgeschiedenis en tijdstempels</li>
                    <li>E-mailvoorkeuren</li>
                    <li>Inschrijvingsstatistieken</li>
                </ul>
                
                <div class="footer">
                    <p><strong>AVG Informatie:</strong><br>
                    Deze data export is gegenereerd conform AVG Artikel 15 (Recht op Toegang). 
                    Als je vragen hebt over deze data of verwijdering wilt aanvragen, 
                    neem dan contact op via privacy@boerengroep.nl</p>
                </div>
            </div>
        `,
        textContent: `
Je Data Export van Stichting Boerengroep

Hallo,

Zoals gevraagd, hier is de data die we hebben opgeslagen voor {{email}}:

{{exportData}}

Deze export bevat:
- Je inschrijvingsinformatie
- Toestemmingsgeschiedenis en tijdstempels
- E-mailvoorkeuren
- Inschrijvingsstatistieken

AVG Informatie:
Deze data export is gegenereerd conform AVG Artikel 15 (Recht op Toegang). Als je vragen hebt over deze data of verwijdering wilt aanvragen, neem dan contact op via privacy@boerengroep.nl
        `,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// Function to insert default templates into database
export async function insertDefaultTemplates(): Promise<void> {
    const { db } = await import('../db');
    const { emailTemplates } = await import('../db/schema');

    try {
        for (const template of defaultTemplates) {
            await db.insert(emailTemplates).values(template).onConflictDoNothing();
        }
        console.log('Default email templates inserted successfully');
    } catch (error) {
        console.error('Error inserting default email templates:', error);
    }
}
