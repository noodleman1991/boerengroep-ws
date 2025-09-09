import Layout from '@/components/layout/layout';
import client from '@/tina/__generated__/client';
import PastEventsClientPage from './client-page';

export const revalidate = 300;

export default async function PastEventsPage({
                                            params,
                                        }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    let pastEvents = await client.queries.pastEventConnection({
        sort: 'date',
        last: 1
    });
    const allPastEvents = pastEvents;

    if (!allPastEvents.data.pastEventConnection.edges) {
        return [];
    }

    while (pastEvents.data?.pastEventConnection.pageInfo.hasPreviousPage) {
        pastEvents = await client.queries.pastEventConnection({
            sort: 'date',
            before: pastEvents.data.pastEventConnection.pageInfo.endCursor,
        });

        if (!pastEvents.data.pastEventConnection.edges) {
            break;
        }

        allPastEvents.data.pastEventConnection.edges.push(...pastEvents.data.pastEventConnection.edges.reverse());
    }

    // Filter past events by locale or show all if no locale-specific past events
    const localeFilteredPastEvents = {
        ...allPastEvents,
        data: {
            ...allPastEvents.data,
            pastEventConnection: {
                ...allPastEvents.data.pastEventConnection,
                edges: allPastEvents.data.pastEventConnection.edges?.filter(edge => {
                    const breadcrumbs = edge?.node?._sys.breadcrumbs || [];
                    return breadcrumbs[0] === locale || !['nl', 'en'].includes(breadcrumbs[0]);
                }) || []
            }
        }
    };

    return (
        <Layout rawPageData={localeFilteredPastEvents.data}>
            <PastEventsClientPage {...localeFilteredPastEvents} />
        </Layout>
    );
}

