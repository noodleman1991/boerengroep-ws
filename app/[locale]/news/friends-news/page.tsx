import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';

interface FriendsNewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FriendsNewsPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('filters.friends')} - Stichting Boerengroep`,
        description: 'News and updates from our partner organizations.',
    };
}

async function getFriendNewsData() {
    try {
        const data = await client.queries.newsletterConnection();
        return {
            newsletters: data.data?.newsletterConnection || { edges: [] },
        };
    } catch (error) {
        console.error('Error fetching friend news data:', error);
        return {
            newsletters: { edges: [] },
        };
    }
}

export default async function FriendsNewsPage({ params }: FriendsNewsPageProps) {
    const { locale } = await params;
    const { newsletters } = await getFriendNewsData();
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
                filter="friends"
                title={t('filters.friends')}
                description="News and updates from our partner organizations and friends in the sustainable agriculture community."
            />
        </Layout>
    );
}
