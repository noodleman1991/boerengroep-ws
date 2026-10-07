#!/usr/bin/env tsx
/**
 * Build-time Pathname Generation Script
 *
 * This script reads all page content from TinaCMS and generates the i18n/routing.ts
 * file with proper pathname mappings for both English and Dutch URLs.
 *
 * Run automatically during build: tinacms build && tsx scripts/generate-pathnames.ts && next build
 * Run manually: pnpm generate:pathnames
 *
 * Safety: This runs after tinacms build syncs content, ensuring routes match CMS data.
 */

import * as fs from 'fs';
import * as path from 'path';

interface PathnameConfig {
    en: string;
    nl: string;
}

type Pathnames = Record<string, string | PathnameConfig>;

// Extract frontmatter from MDX content
function extractFrontmatter(content: string): Record<string, any> {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return {};

    const frontmatter: Record<string, any> = {};
    const lines = frontmatterMatch[1].split('\n');

    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            frontmatter[key] = value;
        }
    }

    return frontmatter;
}

// Recursively scan directory for MDX files
function scanDirectory(dir: string, baseDir: string): Array<{ slug: string; slugNl?: string; filePath: string }> {
    const results: Array<{ slug: string; slugNl?: string; filePath: string }> = [];

    if (!fs.existsSync(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Recurse into subdirectories
            results.push(...scanDirectory(fullPath, baseDir));
        } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const frontmatter = extractFrontmatter(content);

                // Use urlSlug from frontmatter, or derive from filename
                const filename = entry.name.replace(/\.mdx?$/, '');
                const slug = frontmatter.urlSlug || filename;
                const slugNl = frontmatter.urlSlugNl;

                // Get relative path from BASE locale directory (not current dir)
                const relativePath = path.relative(baseDir, fullPath)
                    .replace(/\.mdx?$/, '')
                    .replace(/\\/g, '/'); // Normalize for Windows

                results.push({
                    slug,
                    slugNl,
                    filePath: relativePath,
                });
            } catch (error) {
                console.warn(`Warning: Could not read ${fullPath}:`, error);
            }
        }
    }

    return results;
}

// Build pathname from file path segments
function buildPathname(filePath: string): string {
    const segments = filePath.split('/');
    const lastSegment = segments[segments.length - 1];

    // Skip home/index pages at root
    if (lastSegment === 'home' || lastSegment === 'index') {
        if (segments.length === 1) {
            return '/';
        }
        segments.pop();
    }

    return '/' + segments.join('/');
}

async function generatePathnames() {
    const contentDir = path.join(process.cwd(), 'content/pages');
    const outputFile = path.join(process.cwd(), 'i18n/routing.ts');

    console.log('📁 Scanning content directory:', contentDir);

    const pathnames: Pathnames = {
        '/': '/',
    };

    // Scan English pages
    const enDir = path.join(contentDir, 'en');
    const nlDir = path.join(contentDir, 'nl');

    const enPages = scanDirectory(enDir, enDir);
    const nlPages = scanDirectory(nlDir, nlDir);

    console.log(`Found ${enPages.length} English pages, ${nlPages.length} Dutch pages`);

    // Create a map of Dutch pages by their English equivalent
    const nlPageMap = new Map<string, { slug: string; slugNl?: string; filePath: string }>();
    for (const page of nlPages) {
        nlPageMap.set(page.filePath, page);
    }

    // Process English pages and match with Dutch equivalents
    for (const enPage of enPages) {
        const enPath = buildPathname(enPage.filePath);

        // Skip root path (already defined)
        if (enPath === '/') continue;

        // Check if there's a corresponding Dutch page
        const nlPage = nlPageMap.get(enPage.filePath);

        if (nlPage) {
            // We have corresponding Dutch page
            const nlPath = buildPathname(nlPage.filePath);

            if (enPath !== nlPath) {
                pathnames[enPath] = {
                    en: enPath,
                    nl: nlPath,
                };
            } else {
                pathnames[enPath] = enPath;
            }
        } else {
            // Same path for both locales
            pathnames[enPath] = enPath;
        }
    }

    // Also add any Dutch-only pages
    for (const nlPage of nlPages) {
        const enEquivalent = enPages.find(p => p.filePath === nlPage.filePath);
        if (!enEquivalent) {
            const nlPath = buildPathname(nlPage.filePath);
            if (nlPath !== '/' && !pathnames[nlPath]) {
                pathnames[nlPath] = nlPath;
            }
        }
    }

    // Generate the TypeScript file
    const output = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated by: pnpm generate:pathnames
// Source: scripts/generate-pathnames.ts
// Last generated: ${new Date().toISOString()}

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    pathnames: ${JSON.stringify(pathnames, null, 8).replace(/"([^"]+)":/g, "'$1':")}
});

export const PATHNAMES = {
    HOME: '/',
    ABOUT_US: '/about-us',
    ACTIVITIES: '/activities',
    VACANCIES: '/vacancies',
    NEWS: '/news',
    INSPIRATION_THEATER: '/inspiration-theater',
    LIBRARY: '/library',
    CONTACT: '/contact'
} as const;
`;

    // Write the output file
    fs.writeFileSync(outputFile, output, 'utf-8');

    console.log(`✅ Generated ${outputFile} with ${Object.keys(pathnames).length} routes`);
    console.log('Routes:', Object.keys(pathnames).slice(0, 10).join(', '), '...');
}

// Run the script
generatePathnames().catch((error) => {
    console.error('❌ Error generating pathnames:', error);
    process.exit(1);
});
