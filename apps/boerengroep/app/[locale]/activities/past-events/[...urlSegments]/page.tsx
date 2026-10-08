import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { loadBlockData } from '@/lib/block-data';
import { cms, type Locale } from '@/lib/cms';
import { mediaUrl, toPastEventNode } from '@/lib/cms-adapters';
import { firstParagraph } from '@/lib/page-meta';
import { siteMeta } from '@/lib/site-meta';
import PastEventClientPage from './client-page';

export const revalidate = 3600;

type Params = { locale: Locale; urlSegments: string[] };
const slugOf = (urlSegments: string[]) => decodeURIComponent(urlSegments[urlSegments.length - 1]!);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, urlSegments } = await params;
    setRequestLocale(locale);
    const story = await cms.getPastEvent(slugOf(urlSegments));
    if (!story) return {};
    return siteMeta(locale, {
        title: story.title,
        description: firstParagraph(story.excerpt),
        path: `/activities/past-events/${story.slug}`,
        picture: mediaUrl(story.heroImg, 'og'),
        type: 'article',
    });
}

export default async function PastEventPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale, urlSegments } = await params;
    setRequestLocale(locale);
    const pastEvent = await cms.getPastEvent(slugOf(urlSegments));
    if (!pastEvent) notFound();

    return (
        <Layout rawPageData={pastEvent}>
            <PastEventClientPage pastEvent={toPastEventNode(pastEvent)} data={await loadBlockData(pastEvent.blocks, locale)} />
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
