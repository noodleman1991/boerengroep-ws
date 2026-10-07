import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';
import ClientPage from './client-page';

export const revalidate = 300;

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ locale: string; urlSegments: string[] }>;
}) {
    const resolvedParams = await params;
    const { locale, urlSegments } = resolvedParams;

    // Skip processing for static assets or invalid paths
    if (urlSegments.some(segment =>
        segment.includes('.') || // Files with extensions
        segment.startsWith('_') || // Internal paths
        segment === 'api' ||
        segment === 'admin' ||
        segment === 'blocks'
    )) {
        notFound();
    }

    const filepath = urlSegments.join('/');

    // Function to get the correct file path for the given locale
    const getLocalizedFilePath = (segments: string[], locale: string) => {
        // next-intl middleware normalizes URLs to canonical English paths
        // We need to translate them BACK to locale-specific paths for file lookup
        if (locale === 'nl') {
            // Translate English canonical paths back to Dutch file paths
            const translatedSegments = segments.map(segment => {
                switch (segment) {
                    // Main routes
                    case 'about-us': return 'over-ons';
                    case 'activities': return 'activiteiten';
                    case 'news': return 'nieuws';
                    case 'vacancies': return 'vacatures';
                    case 'library': return 'bibliotheek';
                    case 'newsletters': return 'nieuwsbrieven';
                    case 'newsletter': return 'nieuwsbrief';
                    // About-us subroutes
                    case 'what-is-boerengroep': return 'wat-is-boerengroep';
                    case 'history': return 'geschiedenis';
                    case 'who-are-we': return 'wie-zijn-wij';
                    case 'network': return 'netwerk';
                    // Activities subroutes
                    case 'calendar': return 'agenda';
                    case 'past-events': return 'terugblik';
                    case 'group-studies': return 'groepsstudies';
                    case 'teachers': return 'docenten';
                    case 'forum-reader': return 'forumlezer';
                    case 'soup-kitchen': return 'soepkeuken';
                    case 'calendar-sections': return 'agenda-secties';
                    // News subroutes
                    case 'friends-news': return 'vrienden-nieuws';
                    // Library subroutes
                    case '50-years-bg': return '50-jaar-bg';
                    case 'archive': return 'archief';
                    case 'media': return 'media';
                    case 'podcast': return 'podcast';
                    case '50-years-boerengroep': return '50-years-boerengroep';
                    case 'agroecologie-netwerk': return 'agroecologie-netwerk';
                    // Legal pages
                    case 'privacy-policy': return 'privacybeleid';
                    case 'terms-conditions': return 'algemene-voorwaarden';
                    case 'accessibility': return 'toegankelijkheid';
                    case 'events': return 'evenementen';
                    case 'export-data': return 'exporteer-gegevens';
                    case 'delete-data': return 'verwijder-gegevens';
                    default: return segment;
                }
            });
            return translatedSegments.join('/');
        }
        // For English, use segments as-is (canonical paths match file paths)
        return segments.join('/');
    };

    const localizedFilePath = getLocalizedFilePath(urlSegments, locale);

    let data;
    try {
        // Include locale in relativePath following TinaCMS i18n pattern
        data = await client.queries.page({
            relativePath: `${locale}/${localizedFilePath}.mdx`,
        });
    } catch (error) {
        // Try with /index.mdx for directory index pages
        try {
            data = await client.queries.page({
                relativePath: `${locale}/${localizedFilePath}/index.mdx`,
            });
        } catch (indexError) {
            // Final fallback to non-localized content
            try {
                data = await client.queries.page({
                    relativePath: `${filepath}.mdx`,
                });
            } catch (fallbackError) {
                console.error(`Failed to find page: ${localizedFilePath}`, {
                    locale,
                    filepath: localizedFilePath,
                    error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
                });
                notFound();
            }
        }
    }

    return (
        <Layout rawPageData={data}>
            <Section>
                <ClientPage {...data} />
            </Section>
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en']; // Your configured locales
    let pages = await client.queries.pageConnection();
    const allPages = pages;

    if (!allPages.data.pageConnection.edges) {
        return [];
    }

    while (pages.data.pageConnection.pageInfo.hasNextPage) {
        pages = await client.queries.pageConnection({
            after: pages.data.pageConnection.pageInfo.endCursor,
        });

        if (!pages.data.pageConnection.edges) {
            break;
        }

        allPages.data.pageConnection.edges.push(...pages.data.pageConnection.edges);
    }

    const params: { locale: string; urlSegments: string[] }[] = [];

    allPages.data?.pageConnection.edges.forEach((edge) => {
        const breadcrumbs = edge?.node?._sys.breadcrumbs || [];

        // Skip invalid paths
        if (breadcrumbs.some(segment =>
            segment.includes('.') ||
            segment.startsWith('_') ||
            segment === 'api' ||
            segment === 'admin' ||
            segment === 'blocks'
        )) {
            return;
        }

        // Check if this is a localized page (starts with locale)
        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            // Localized content: locale/path/to/page
            const locale = breadcrumbs[0];
            const urlSegments = breadcrumbs.slice(1);

            if (urlSegments.length >= 1 && !urlSegments.every(segment => segment === 'home')) {
                params.push({ locale, urlSegments });
            }
        } else {
            // Non-localized content: generate for all locales
            if (breadcrumbs.length >= 1 && !breadcrumbs.every(segment => segment === 'home')) {
                locales.forEach(locale => {
                    params.push({ locale, urlSegments: breadcrumbs });
                });
            }
        }
    });

    return params;
}
