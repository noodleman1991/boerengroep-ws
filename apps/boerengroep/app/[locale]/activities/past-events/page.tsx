import Layout from '@/components/layout/layout';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cms, type Locale } from '@/lib/cms';
import { toPastEventNode } from '@/lib/cms-adapters';
import { siteMeta } from '@/lib/site-meta';
import PastEventsClientPage from './client-page';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'pastEvents' });
    return siteMeta(locale, { title: t('title'), description: t('description'), path: '/activities/past-events' });
}

export default async function PastEventsPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    // The query already returns this locale's recaps plus those without a language, newest first.
    const pastEvents = (await cms.listPastEvents(locale)).map(toPastEventNode);

    return (
        <Layout rawPageData={pastEvents}>
            <PastEventsClientPage pastEvents={pastEvents} />
        </Layout>
    );
}
