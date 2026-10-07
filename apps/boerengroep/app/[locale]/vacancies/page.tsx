import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { client } from '@/tina/__generated__/client';
import { VacanciesPage } from '@/components/vacancies-page';
import Layout from '@/components/layout/layout';

interface VacanciesPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: VacanciesPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'vacancies' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function getVacanciesData() {
    try {
        const data = await client.queries.vacancyQuery();
        return {
            vacancies: data.data?.vacancyConnection || { edges: [] },
        };
    } catch (error) {
        console.error('Error fetching vacancies data:', error);
        return {
            vacancies: { edges: [] },
        };
    }
}

export default async function VacanciesRoute({ params }: VacanciesPageProps) {
    const { locale } = await params;
    const { vacancies } = await getVacanciesData();

    // Mock layout data for the Layout component
    const mockLayoutData = {
        data: {
            global: null // This will be fetched by the Layout component itself
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <VacanciesPage vacancies={vacancies} locale={locale} />
        </Layout>
    );
}
