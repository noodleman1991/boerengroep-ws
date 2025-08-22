import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import NewsletterClientPage from './client-page';

export const revalidate = 300;

export default async function FriendsNewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    const filepath = slug.join('/');

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

    // Verify this newsletter belongs to friends organizations
    const newsletter = data.data.newsletter;
    if (newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater') {
        notFound();
    }

    return (
        <Layout rawPageData={data}>
            <NewsletterClientPage {...data} backPath="/news/friends-news" />
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

    const params: { locale: string; slug: string[] }[] = [];

    allNewsletters.data?.newsletterConnection.edges.forEach((edge) => {
        const newsletter = edge?.node;
        if (!newsletter?.organization) return;

        // Only include friends organizations (exclude main orgs)
        if (newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater') {
            return;
        }

        const breadcrumbs = newsletter._sys.breadcrumbs || [];

        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            const locale = breadcrumbs[0];
            const slug = breadcrumbs.slice(1);

            if (slug.length >= 1) {
                params.push({ locale, slug });
            }
        } else {
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, slug: breadcrumbs });
                });
            }
        }
    });

    return params;
}
