import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cms } from '@/lib/cms';
import { asConnection, toVacancyNode } from '@/lib/cms-adapters';
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
        return { vacancies: asConnection((await cms.listVacancies()).map(toVacancyNode)) };
    } catch (error) {
        console.error('Error fetching vacancies data:', error);
        return { vacancies: { edges: [] } };
    }
}

export default async function VacanciesRoute({ params }: VacanciesPageProps) {
    const { locale } = await params;
    const { vacancies } = await getVacanciesData();


    return (
        <Layout>
            <VacanciesPage vacancies={vacancies} locale={locale} />
        </Layout>
    );
}
