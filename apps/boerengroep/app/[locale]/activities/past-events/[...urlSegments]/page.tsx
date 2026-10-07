import React from 'react';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import PastEventClientPage from './client-page';

export const revalidate = 300;

export default async function PastEventPage({
                                           params,
                                       }: {
    params: Promise<{ locale: string; urlSegments: string[] }>;
}) {
    const { locale, urlSegments } = await params;
    const filepath = urlSegments.join('/');

    let data;
    try {
        // Try locale-specific past event first
        data = await client.queries.pastEvent({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized past event
        data = await client.queries.pastEvent({
            relativePath: `${filepath}.mdx`,
        });
    }

    return (
        <Layout rawPageData={data}>
            <PastEventClientPage {...data} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en']; // Your configured locales
    let pastEvents = await client.queries.pastEventConnection();
    const allPastEvents = pastEvents;

    if (!allPastEvents.data.pastEventConnection.edges) {
        return [];
    }

    while (pastEvents.data?.pastEventConnection.pageInfo.hasNextPage) {
        pastEvents = await client.queries.pastEventConnection({
            after: pastEvents.data.pastEventConnection.pageInfo.endCursor,
        });

        if (!pastEvents.data.pastEventConnection.edges) {
            break;
        }

        allPastEvents.data.pastEventConnection.edges.push(...pastEvents.data.pastEventConnection.edges);
    }

    const params: { locale: string; urlSegments: string[] }[] = [];

    allPastEvents.data?.pastEventConnection.edges.forEach((edge) => {
        const breadcrumbs = edge?.node?._sys.breadcrumbs || [];

        // Check if this is a localized past event (starts with locale)
        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            // Localized content: locale/path/to/past-event
            const locale = breadcrumbs[0];
            const urlSegments = breadcrumbs.slice(1);

            if (urlSegments.length >= 1) {
                params.push({ locale, urlSegments });
            }
        } else {
            // Non-localized content: generate for all locales
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, urlSegments: breadcrumbs });
                });
            }
        }
    });

    return params;
}
