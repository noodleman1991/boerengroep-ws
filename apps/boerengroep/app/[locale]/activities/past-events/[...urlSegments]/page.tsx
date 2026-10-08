import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { loadBlockData } from '@/lib/block-data';
import { cms, type Locale } from '@/lib/cms';
import { toPastEventNode } from '@/lib/cms-adapters';
import PastEventClientPage from './client-page';

export const revalidate = 3600;

export default async function PastEventPage({
    params,
}: {
    params: Promise<{ locale: Locale; urlSegments: string[] }>;
}) {
    const { locale, urlSegments } = await params;
    setRequestLocale(locale);
    const pastEvent = await cms.getPastEvent(decodeURIComponent(urlSegments[urlSegments.length - 1]!));
    if (!pastEvent) notFound();

    return (
        <Layout rawPageData={pastEvent}>
            <PastEventClientPage pastEvent={toPastEventNode(pastEvent)} data={await loadBlockData(pastEvent.blocks)} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const params: { locale: Locale; urlSegments: string[] }[] = [];
    for (const locale of ['en', 'nl'] as const) {
        for (const p of await cms.listPastEvents(locale)) params.push({ locale, urlSegments: [p.slug] });
    }
    return params;
}
