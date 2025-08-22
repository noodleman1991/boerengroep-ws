import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { FriendNewsPage } from '@/components/friend-news-page';
import Layout from '@/components/layout/layout';

interface FriendNewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FriendNewsPageProps): Promise<Metadata> {
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

export default async function FriendNewsRoute({ params }: FriendNewsPageProps) {
    const { locale } = await params;
    const { newsletters } = await getFriendNewsData();

    // Filter for friend organizations only
    const friendNewsletters = {
        ...newsletters,
        edges: newsletters.edges?.filter(edge => {
            const org = edge?.node?.organization;
            return org && org !== 'Boerengroep' && org !== 'Inspiratietheater';
        }) || []
    };

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <FriendNewsPage newsletters={friendNewsletters} locale={locale} />
        </Layout>
    );
}
