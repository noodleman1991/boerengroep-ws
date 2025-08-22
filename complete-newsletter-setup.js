#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol} ${message}${colors.reset}`);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log('green', '📁', `Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  log('green', '📝', `Created: ${filePath}`);
}

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║            🌾 STICHTING BOERENGROEP NEWSLETTER SYSTEM SETUP 🌾              ║
║                                                                              ║
║  Setting up complete newsletter system with:                                ║
║  • TinaCMS Content Management                                               ║
║  • Resend Email Integration                                                 ║
║  • GDPR Compliance                                                          ║
║  • English/Dutch i18n                                                       ║
║  • Responsive Design                                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  log('red', '❌', 'package.json not found. Please run this script from your project root.');
  process.exit(1);
}

log('blue', '🚀', 'Starting setup...');

// 1. Install dependencies
log('blue', '📦', 'Installing dependencies...');
try {
  execSync('pnpm add drizzle-orm @neondatabase/serverless drizzle-kit zod react-hook-form @hookform/resolvers resend tsx --save', { stdio: 'inherit' });
  log('green', '✅', 'Dependencies installed');
} catch (error) {
  log('red', '❌', 'Failed to install dependencies');
  process.exit(1);
}

// 2. Update package.json scripts
log('blue', '⚙️', 'Adding npm scripts...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.scripts) packageJson.scripts = {};

const newScripts = {
  'db:generate': 'drizzle-kit generate',
  'db:migrate': 'drizzle-kit migrate',
  'db:studio': 'drizzle-kit studio',
  'newsletter:seed': 'tsx scripts/seed-newsletter.ts',
  'newsletter:test': 'tsx scripts/test-newsletter.ts'
};

Object.assign(packageJson.scripts, newScripts);

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
log('green', '✅', 'Package.json updated with newsletter scripts');

// 3. Create/update environment file
if (!fs.existsSync('.env.local')) {
  const envContent = `# Database (your existing connection)
DATABASE_URL="postgresql://neondb_owner:npg_yVcUFaCRo47u@ep-bold-salad-a9qekq6c-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require"

# Email Configuration with Resend
RESEND_BOERENGROEP="your_resend_token_here"
FROM_EMAIL="newsletter@boerengroep.nl"
FROM_NAME="Stichting Boerengroep"
REPLY_TO_EMAIL="info@boerengroep.nl"

# Newsletter Configuration
NEWSLETTER_SECRET="newsletter-secret-${Date.now()}-${Math.random().toString(36).substring(7)}"
BASE_URL="http://localhost:3000"
NODE_ENV="development"
`;
  writeFile('.env.local', envContent);
  log('yellow', '⚠️', 'Please update RESEND_BOERENGROEP in .env.local with your actual token!');
} else {
  log('green', '✅', 'Found existing .env.local file');

  // Check if required vars exist
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (!envContent.includes('RESEND_BOERENGROEP')) {
    log('yellow', '⚠️', 'RESEND_BOERENGROEP not found in .env.local. Please add it.');
  }
  if (!envContent.includes('NEWSLETTER_SECRET')) {
    log('yellow', '⚠️', 'NEWSLETTER_SECRET not found in .env.local. Please add it.');
  }
}

// 4. Create seed script
const seedScript = `import { db } from '../lib/db';
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
`;
writeFile('scripts/seed-newsletter.ts', seedScript);

// 5. Create test script
const testScript = `import { sendTestEmail, verifyEmailConfig } from '../lib/email';

async function testNewsletter() {
    console.log('🧪 Testing newsletter system...');
    
    // Test email configuration
    console.log('📧 Testing Resend configuration...');
    const emailConfigOk = await verifyEmailConfig();
    
    if (emailConfigOk) {
        console.log('✅ Resend email configuration is valid');
        
        // Test sending email (update with your email)
        const testEmail = 'your-email@example.com'; // UPDATE THIS!
        console.log(\`📤 Sending test email to \${testEmail}...\`);
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
`;
writeFile('scripts/test-newsletter.ts', testScript);

// 6. Create example newsletter content
ensureDir('content/newsletters/nl');
ensureDir('content/newsletters/en');

const dutchExample = `---
title: "Nieuw Onderzoek: Regeneratieve Landbouw in Nederland"
type: "link"
organization: "Boerengroep"
publishDate: "2025-01-15T10:00:00.000Z"
tags: ["onderzoek", "regeneratieve-landbouw", "nederland"]
externalLink: "https://example.com/regenerative-farming-research"
linkDescription: "Een uitgebreid onderzoek naar de voordelen van regeneratieve landbouwpraktijken voor Nederlandse boeren."
featured: true
published: true
---
`;

const englishExample = `---
title: "A Complete Guide to Sustainable Farming Practices"
type: "content"
organization: "Boerengroep"
publishDate: "2025-01-10T14:00:00.000Z"
tags: ["guide", "sustainable-farming", "education"]
author: "content/speakers/dr-maria-van-der-meer.md"
featuredImage: "/uploads/newsletters/sustainable-farming-header.jpg"
excerpt: "Discover practical steps to implement sustainable farming practices on your land."
featured: false
published: true
body:
  - _template: content
    body: |
      # Welcome to Sustainable Farming
      
      This comprehensive guide will help you understand the fundamentals of sustainable agriculture and how to implement these practices on your farm.
      
      ## Key Principles
      
      Sustainable farming is built on several core principles:
      
      - **Soil health preservation**: Maintaining and improving soil structure and fertility
      - **Water conservation**: Efficient use and protection of water resources  
      - **Biodiversity enhancement**: Creating habitats for beneficial organisms
      - **Natural pest management**: Using ecological methods for pest control
      
      ## Getting Started
      
      The transition to sustainable farming practices can seem daunting, but with the right approach, it becomes an achievable and rewarding journey.
---
`;

writeFile('content/newsletters/nl/voorbeeld-externe-link.mdx', dutchExample);
writeFile('content/newsletters/en/sustainable-farming-guide.mdx', englishExample);

// 7. Generate and run migrations
log('blue', '🗄️', 'Setting up database...');
try {
  log('blue', '⚙️', 'Generating database migration...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  log('green', '✅', 'Database migration generated');

  log('blue', '⚙️', 'Applying database migration...');
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
  log('green', '✅', 'Database migration applied');
} catch (error) {
  log('yellow', '⚠️', 'Database setup had issues. You may need to run manually:');
  console.log('  npx drizzle-kit generate');
  console.log('  npx drizzle-kit migrate');
}

// 8. Seed database
log('blue', '🌱', 'Seeding database with email templates...');
try {
  execSync('npm run newsletter:seed', { stdio: 'inherit' });
  log('green', '✅', 'Database seeded successfully');
} catch (error) {
  log('yellow', '⚠️', 'Database seeding had issues. Run manually: npm run newsletter:seed');
}

// 9. Final success message
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                          🎉 SETUP COMPLETE! 🎉                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

log('green', '✅', 'Newsletter System is now installed and configured!');
console.log('');

log('blue', 'ℹ️', 'NEXT STEPS:');
console.log('1. 📧 Update RESEND_BOERENGROEP token in .env.local');
console.log('2. ✏️  Update test email in scripts/test-newsletter.ts');
console.log('3. 🧪 Run: npm run newsletter:test');
console.log('4. 🌐 Visit /newsletters to see the newsletter page');
console.log('5. 📝 Try newsletter signup in your footer');
console.log('6. ⚙️  Add content via /admin (TinaCMS)');
console.log('');

log('blue', 'ℹ️', 'AVAILABLE COMMANDS:');
console.log('• npm run db:generate     - Generate database migrations');
console.log('• npm run db:migrate      - Apply database migrations');
console.log('• npm run db:studio       - Open Drizzle Studio');
console.log('• npm run newsletter:seed - Seed email templates');
console.log('• npm run newsletter:test - Test email functionality');
console.log('');

log('blue', 'ℹ️', 'NEWSLETTER PAGES:');
console.log('• http://localhost:3000/newsletters     - Main newsletter listing');
console.log('• http://localhost:3000/friend-news     - Friend organizations news');
console.log('• http://localhost:3000/admin           - TinaCMS admin panel');
console.log('');

log('green', '🎯', 'Your footer newsletter signup is now functional!');
console.log('');
log('yellow', '⚠️', 'PRODUCTION REMINDERS:');
console.log('• Set strong NEWSLETTER_SECRET for production');
console.log('• Update BASE_URL for production environment');
console.log('• Verify domain configuration in Resend dashboard');
console.log('• Test email deliverability in production');
console.log('');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  📚 For detailed documentation, see NEWSLETTER_SETUP.md                     ║
║  🆘 For troubleshooting, check the setup guide                              ║
║  🎉 Happy newsletter management!                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
