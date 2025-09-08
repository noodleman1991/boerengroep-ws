import React from 'react';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import PostClientPage from './client-page';

export const revalidate = 300;

export default async function PostPage({
                                           params,
                                       }: {
    params: Promise<{ locale: string; urlSegments: string[] }>;
}) {
    const { locale, urlSegments } = await params;
    const filepath = urlSegments.join('/');

    let data;
    try {
        // Try locale-specific post first
        data = await client.queries.post({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized post
        data = await client.queries.post({
            relativePath: `${filepath}.mdx`,
        });
    }

    return (
        <Layout rawPageData={data}>
            <PostClientPage {...data} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en']; // Your configured locales
    let posts = await client.queries.postConnection();
    const allPosts = posts;

    if (!allPosts.data.postConnection.edges) {
        return [];
    }

    while (posts.data?.postConnection.pageInfo.hasNextPage) {
        posts = await client.queries.postConnection({
            after: posts.data.postConnection.pageInfo.endCursor,
        });

        if (!posts.data.postConnection.edges) {
            break;
        }

        allPosts.data.postConnection.edges.push(...posts.data.postConnection.edges);
    }

    const params: { locale: string; urlSegments: string[] }[] = [];

    allPosts.data?.postConnection.edges.forEach((edge) => {
        const breadcrumbs = edge?.node?._sys.breadcrumbs || [];

        // Check if this is a localized post (starts with locale)
        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            // Localized content: locale/path/to/post
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
