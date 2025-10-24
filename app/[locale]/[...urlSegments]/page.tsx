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
        // For Dutch locale, we need to translate URL segments back to file system paths
        if (locale === 'nl') {
            const translatedSegments = segments.map(segment => {
                switch (segment) {
                    // Main routes
                    case 'activiteiten': return 'activities';
                    case 'over-ons': return 'about-us';
                    case 'nieuws': return 'news';
                    case 'vacatures': return 'vacancies';
                    case 'bibliotheek': return 'library';
                    case 'nieuwsbrieven': return 'newsletters';
                    case 'nieuwsbrief': return 'newsletter';
                    // About-us subroutes
                    case 'wat-is-boerengroep': return 'what-is-boerengroep';
                    case 'geschiedenis': return 'history';
                    case 'wie-zijn-wij': return 'who-are-we';
                    case 'netwerk': return 'network';
                    // Activities subroutes
                    case 'agenda': return 'calendar';
                    case 'terugblik': return 'past-events';
                    case 'groepsstudies': return 'group-studies';
                    case 'docenten': return 'teachers';
                    case 'forumlezer': return 'forum-reader';
                    case 'soepkeuken': return 'soup-kitchen';
                    // News subroutes
                    case 'nieuwsbrief': return 'newsletter';
                    case 'vrienden-nieuws': return 'friends-news';
                    // Library subroutes
                    case '50-jaar-bg': return '50-years-bg';
                    // Legal pages
                    case 'privacybeleid': return 'privacy-policy';
                    case 'algemene-voorwaarden': return 'terms-conditions';
                    case 'toegankelijkheid': return 'accessibility';
                    case 'evenementen': return 'events';
                    case 'exporteer-gegevens': return 'export-data';
                    case 'verwijder-gegevens': return 'delete-data';
                    default: return segment;
                }
            });
            return translatedSegments.join('/');
        }
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
        // Fallback to default locale or non-localized content
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
