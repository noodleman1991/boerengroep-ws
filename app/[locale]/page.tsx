import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import ClientPage from "../[locale]/[...urlSegments]/client-page";

export const revalidate = 300;

async function getHomeData(locale: string) {
    try {
        // Fetch page data
        let pageData;
        try {
            // Try locale-specific home page firstclaude
            pageData = await client.queries.page({
                relativePath: `${locale}/home.mdx`,
            });
        } catch (error) {
            // Fallback to default home page
            pageData = await client.queries.page({
                relativePath: `home.mdx`,
            });
        }

        // Fetch events data for the calendar preview component
        let eventsData;
        try {
            eventsData = await client.queries.calendarQuery();
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsData = { data: { eventConnection: { edges: [] } } };
        }

        const events = eventsData.data?.eventConnection?.edges?.map(edge => edge?.node).filter(Boolean) || [];

        // Fetch global data for homepage settings
        let globalData;
        try {
            globalData = await client.queries.global({ relativePath: 'index.json' });
        } catch (error) {
            console.error('Error fetching global data:', error);
            globalData = { data: { global: null } };
        }

        return {
            pageData,
            events,
            globalData: globalData.data?.global,
        };
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
}

export default async function Home({
                                       params,
                                   }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const { pageData, events, globalData } = await getHomeData(locale);

    return (
        <Layout rawPageData={pageData}>
            <ClientPageWithEvents pageData={pageData} events={events} globalData={globalData} />
        </Layout>
    );
}

// Client component wrapper to handle events data
function ClientPageWithEvents({ pageData, events, globalData }: { pageData: any; events: any[]; globalData: any }) {
    return <ClientPage {...pageData} events={events} globalData={globalData} />;
}
