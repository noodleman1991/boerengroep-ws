import 'dotenv/config'; // Load environment variables
import { sendTestEmail, verifyEmailConfig } from '../lib/email';

async function testNewsletter() {
    console.log('🧪 Testing newsletter system...');

    // Test email configuration
    console.log('📧 Testing Resend configuration...');
    const emailConfigOk = await verifyEmailConfig();

    if (emailConfigOk) {
        console.log('✅ Resend email configuration is valid');

        // Test sending email (update with your email)
        const testEmail = 'your-email@example.com'; // UPDATE THIS!
        console.log(`📤 Sending test email to ${testEmail}...`);
        console.log('⚠️  Make sure to update the email address above!');

        if (testEmail === 'your-email@example.com') {
            console.log('🔄 Skipping email send - please update the email address first');
            return;
        }

        const testEmailSent = await sendTestEmail(testEmail);
        if (testEmailSent) {
            console.log('✅ Test email sent successfully via Resend');
            console.log('📬 Check your inbox (and spam folder)!');
        } else {
            console.log('❌ Test email failed to send');
            console.log('💡 Check your RESEND_BOERENGROEP token and Resend dashboard');
        }
    } else {
        console.log('❌ Resend configuration failed');
        console.log('💡 Please check:');
        console.log('   - RESEND_BOERENGROEP token in .env.local');
        console.log('   - Domain configuration in Resend dashboard');
        console.log('   - FROM_EMAIL is using verified domain');
    }
}

testNewsletter().catch(console.error);
