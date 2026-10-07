import Layout from '@/components/layout/layout';
import { setRequestLocale } from 'next-intl/server';
import { cms, type Locale } from '@/lib/cms';
import { toPastEventNode } from '@/lib/cms-adapters';
import PastEventsClientPage from './client-page';

export const revalidate = 3600;

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
