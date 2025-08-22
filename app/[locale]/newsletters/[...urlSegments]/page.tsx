import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import NewsletterClientPage from './client-page';

export const revalidate = 300;

export default async function NewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: string; urlSegments: string[] }>;
}) {
    const { locale, urlSegments } = await params;
    const filepath = urlSegments.join('/');

    let data;
    try {
        // Try locale-specific newsletter first
        data = await client.queries.newsletter({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized newsletter
        try {
            data = await client.queries.newsletter({
                relativePath: `${filepath}.mdx`,
            });
        } catch (fallbackError) {
            notFound();
        }
    }

    return (
        <Layout rawPageData={data}>
            <NewsletterClientPage {...data} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en'];
    let newsletters = await client.queries.newsletterConnection();
    const allNewsletters = newsletters;

    if (!allNewsletters.data.newsletterConnection.edges) {
        return [];
    }

    while (newsletters.data?.newsletterConnection.pageInfo.hasNextPage) {
        newsletters = await client.queries.newsletterConnection({
            after: newsletters.data.newsletterConnection.pageInfo.endCursor,
        });

        if (!newsletters.data.newsletterConnection.edges) {
            break;
        }

        allNewsletters.data.newsletterConnection.edges.push(...newsletters.data.newsletterConnection.edges);
    }

    const params: { locale: string; urlSegments: string[] }[] = [];

    allNewsletters.data?.newsletterConnection.edges.forEach((edge) => {
        const breadcrumbs = edge?.node?._sys.breadcrumbs || [];

        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            const locale = breadcrumbs[0];
            const urlSegments = breadcrumbs.slice(1);

            if (urlSegments.length >= 1) {
                params.push({ locale, urlSegments });
            }
        } else {
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, urlSegments: breadcrumbs });
                });
            }
        }
    });

    return params;
}
