import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cms } from '@/lib/cms';
import { asConnection, toNewsletterNode } from '@/lib/cms-adapters';
import { NewsletterList } from '@/components/newsletter-list';
import Layout from '@/components/layout/layout';

interface NewsletterPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function getNewsletterData() {
    try {
        return { newsletters: asConnection((await cms.listNewsletters()).map(toNewsletterNode)) };
    } catch (error) {
        console.error('Error fetching newsletter data:', error);
        return { newsletters: { edges: [] } };
    }
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { newsletters } = await getNewsletterData();
    const t = await getTranslations({ locale, namespace: 'newsletter' });


    return (
        <Layout>
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
