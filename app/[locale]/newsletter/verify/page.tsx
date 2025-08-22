import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { VerifyEmailPage } from '@/components/newsletter/verify-email-page';
import Layout from '@/components/layout/layout';

interface VerifyPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('verify.title')} - Stichting Boerengroep`,
        description: t('verify.description'),
    };
}

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
    const { locale } = await params;
    const { token } = await searchParams;

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <VerifyEmailPage locale={locale} token={token} />
        </Layout>
    );
}
