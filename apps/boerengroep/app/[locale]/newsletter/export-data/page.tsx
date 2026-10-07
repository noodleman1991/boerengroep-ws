import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ExportDataPage } from '@/components/newsletter/export-data-page';
import Layout from '@/components/layout/layout';

interface ExportDataPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ExportDataPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'newsletter' });

    return {
        title: `${t('exportData.title')} - Stichting Boerengroep`,
        description: t('exportData.description'),
    };
}

export default async function ExportDataRoute({ params }: ExportDataPageProps) {
    const { locale } = await params;

    const mockLayoutData = {
        data: {
            global: null
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <ExportDataPage locale={locale} />
        </Layout>
    );
}
