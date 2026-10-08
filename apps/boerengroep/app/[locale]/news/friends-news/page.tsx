import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cms } from '@/lib/cms';
import { asConnection, toNewsletterNode } from '@/lib/cms-adapters';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';
import { SITE } from '@/site.config';

interface FriendsNewsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FriendsNewsPageProps): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('filters.friends')} - ${SITE.name}`,
        description: t('friends_description'),
    };
}

async function getFriendNewsData() {
    try {
        return { newsletters: asConnection((await cms.listNewsletters()).map(toNewsletterNode)) };
    } catch (error) {
        console.error('Error fetching newsletter data:', error);
        return { newsletters: { edges: [] } };
    }
}

export default async function FriendsNewsPage({ params }: FriendsNewsPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { newsletters } = await getFriendNewsData();
    const t = await getTranslations({ locale, namespace: 'newsletter' });


    return (
        <Layout>
            <NewsletterList
                newsletters={newsletters}
                locale={locale}
                filter="friends"
                title={t('filters.friends')}
                description={t('friends_description')}
            />
        </Layout>
    );
}
