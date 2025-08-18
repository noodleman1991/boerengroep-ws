import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import PostsClientPage from './client-page';

export const revalidate = 300;

export default async function PostsPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    let posts = await client.queries.postConnection({
        sort: 'date',
        last: 1
    });
    const allPosts = posts;

    if (!allPosts.data.postConnection.edges) {
        return [];
    }

    while (posts.data?.postConnection.pageInfo.hasPreviousPage) {
        posts = await client.queries.postConnection({
            sort: 'date',
            before: posts.data.postConnection.pageInfo.endCursor,
        });

        if (!posts.data.postConnection.edges) {
            break;
        }

        allPosts.data.postConnection.edges.push(...posts.data.postConnection.edges.reverse());
    }

    // Filter posts by locale or show all if no locale-specific posts
    const localeFilteredPosts = {
        ...allPosts,
        data: {
            ...allPosts.data,
            postConnection: {
                ...allPosts.data.postConnection,
                edges: allPosts.data.postConnection.edges?.filter(edge => {
                    const breadcrumbs = edge?.node?._sys.breadcrumbs || [];
                    return breadcrumbs[0] === locale || !['nl', 'en'].includes(breadcrumbs[0]);
                }) || []
            }
        }
    };

    return (
        <Layout rawPageData={localeFilteredPosts.data}>
            <PostsClientPage {...localeFilteredPosts} />
        </Layout>
    );
}
