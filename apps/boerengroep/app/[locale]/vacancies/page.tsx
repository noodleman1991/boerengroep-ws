import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { VacanciesPage } from '@/components/vacancies-page';
import { cms, type Locale } from '@/lib/cms';
import { toVacancyNode } from '@/lib/cms-adapters';
import { siteMeta } from '@/lib/site-meta';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'vacancies' });
    return siteMeta(locale, { title: t('title'), description: t('description'), path: '/vacancies' });
}

/** The vacancies in the reader's language. What is not written in Dutch yet is shown in English. */
export default async function VacanciesRoute({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const vacancies = (await cms.listVacancies(locale)).map(toVacancyNode);

    return (
        <Layout>
            <VacanciesPage vacancies={vacancies} locale={locale} renderedAt={new Date().toISOString()} />
        </Layout>
    );
}
