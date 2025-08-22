#!/bin/bash
# Quick Fix Script for Newsletter Issues

echo "🔧 Starting quick fix for newsletter issues..."

# 1. Create newsletter collection directory
echo "📁 Creating newsletter collection..."
mkdir -p tina/collection

# 2. Stop development server if running
echo "🛑 Stopping any running processes..."
pkill -f "next dev" || true
pkill -f "tinacms dev" || true

# 3. Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf .tina
rm -rf tina/__generated__

# 4. Create content directories
echo "📂 Creating content directories..."
mkdir -p content/newsletters/nl
mkdir -p content/newsletters/en

# 5. Install required dependencies
echo "📦 Installing dependencies..."
pnpm add @neondatabase/serverless drizzle-orm resend
pnpm add -D drizzle-kit tsx dotenv-cli

# 6. Create missing config file if needed
if [ ! -f "next.config.base.js" ]; then
  echo "⚙️ Creating next.config.base.js..."
  cat > next.config.base.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH || '',
};

module.exports = nextConfig;
EOF
fi

# 7. Create placeholder newsletter content
echo "📝 Creating example newsletter content..."
cat > content/newsletters/nl/welcome-partners.mdx << 'EOF'
---
title: "Welkom Partner Organisaties"
type: "article"
organization: "partner"
publishDate: "2024-01-15T10:00:00.000Z"
published: true
featured: false
tags: ["welcome", "partnership"]
excerpt: "Een warme welkom aan onze partner organisaties."
---

# Welkom bij onze Partner Organisaties

We zijn verheugd onze partners te verwelkomen in het duurzame landbouwnetwerk.
EOF

cat > content/newsletters/en/welcome-partners.mdx << 'EOF'
---
title: "Welcome Partner Organizations"
type: "article"
organization: "partner"
publishDate: "2024-01-15T10:00:00.000Z"
published: true
featured: false
tags: ["welcome", "partnership"]
excerpt: "A warm welcome to our partner organizations."
---

# Welcome to Our Partner Organizations

We're excited to welcome our partners to the sustainable agriculture network.
EOF

# 8. Build TinaCMS schema
echo "🔨 Building TinaCMS schema..."
pnpm build || echo "Build failed, but continuing..."

# 9. Try starting development server
echo "🚀 Starting development server..."
echo "If this fails, please:"
echo "1. Copy the newsletter collection code to tina/collection/newsletter.ts"
echo "2. Update tina/config.tsx to import Newsletter"
echo "3. Replace verifyEmailConfig function in lib/email/index.ts"
echo "4. Set up your environment variables"

# Start dev server
pnpm dev
