import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DeleteDataPage } from '@/components/newsletter/delete-data-page';
import Layout from '@/components/layout/layout';

interface DeleteDataPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: DeleteDataPageProps): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('deleteData.title')} - Stichting Boerengroep`,
        description: t('deleteData.description'),
    };
}

export default async function DeleteDataRoute({ params, searchParams }: DeleteDataPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { token } = await searchParams;

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <DeleteDataPage locale={locale} token={token} />
        </Layout>
    );
}
