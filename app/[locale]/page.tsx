import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import ClientPage from "../[locale]/[...urlSegments]/client-page";

export const revalidate = 300;

export default async function Home({
                                       params,
                                   }: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    let data;
    try {
        // Try locale-specific home page first
        data = await client.queries.page({
            relativePath: `${locale}/home.mdx`,
        });
    } catch (error) {
        // Fallback to default home page
        data = await client.queries.page({
            relativePath: `home.mdx`,
        });
    }

    return (
        <Layout rawPageData={data}>
            <ClientPage {...data} />
        </Layout>
    );
}
