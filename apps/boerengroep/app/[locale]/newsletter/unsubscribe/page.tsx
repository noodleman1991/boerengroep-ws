import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UnsubscribePage } from '@/components/newsletter/unsubscribe-page';
import Layout from '@/components/layout/layout';

interface UnsubscribePageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: UnsubscribePageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('unsubscribe.title')} - Stichting Boerengroep`,
        description: t('unsubscribe.description'),
    };
}

export default async function UnsubscribeRoute({ params, searchParams }: UnsubscribePageProps) {
    const { locale } = await params;
    const { token } = await searchParams;

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <UnsubscribePage locale={locale} token={token} />
        </Layout>
    );
}
