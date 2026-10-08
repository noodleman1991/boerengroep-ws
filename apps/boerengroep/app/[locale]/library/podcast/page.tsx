import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';
import { loadPodcast } from '@/lib/podcast';
import { podcastPage } from '@/lib/podcast-page';
import { PodcastClientPage } from './client-page';
import { SITE } from '@/site.config';

interface PodcastPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'podcast' });

    return {
        title: `${t('title')} - ${SITE.name}`,
        description: t('description'),
    };
}

export default async function PodcastPage({ params }: PodcastPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    // Read straight from the feed. Asking this site's own address would fail while the site is being built.
    const podcast = podcastPage(await loadPodcast(), 6, 0);

    // Mock layout data for the Layout component
    const mockLayoutData = {
        data: {
            global: null // This will be fetched by the Layout component itself
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <Section>
                <PodcastClientPage
                    podcast={podcast}
                    locale={locale}
                />
            </Section>
        </Layout>
    );
}
