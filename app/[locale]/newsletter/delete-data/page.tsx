import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DeleteDataPage } from '@/components/newsletter/delete-data-page';
import Layout from '@/components/layout/layout';

interface DeleteDataPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DeleteDataPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('deleteData.title')} - Stichting Boerengroep`,
        description: t('deleteData.description'),
    };
}

export default async function DeleteDataRoute({ params }: DeleteDataPageProps) {
    const { locale } = await params;

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <DeleteDataPage locale={locale} />
        </Layout>
    );
}
