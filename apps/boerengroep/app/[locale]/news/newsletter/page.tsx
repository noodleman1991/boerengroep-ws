import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';

interface NewsletterPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function getNewsletterData() {
    try {
        const data = await client.queries.newsletterConnection();
        return {
            newsletters: data.data?.newsletterConnection || { edges: [] },
        };
    } catch (error) {
        console.error('Error fetching newsletter data:', error);
        return {
            newsletters: { edges: [] },
        };
    }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
    const { locale } = await params;
    const { newsletters } = await getNewsletterData();
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <NewsletterList
                newsletters={newsletters}
                locale={locale}
                filter="main"
                title={t('title')}
                description={t('description')}
            />
        </Layout>
    );
}
