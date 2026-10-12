import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NewsletterHelpPage } from '@/components/newsletter/help-page';
import Layout from '@/components/layout/layout';
import { SITE } from '@/site.config';

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'newsletter.yourData' });

    return {
        title: `${t('title')} - ${SITE.name}`,
        description: t('description'),
    };
}

/** What is kept about a reader of the newsletter, and who to ask to erase it. */
export default async function Page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <Layout rawPageData={{ data: { global: null } }}>
            <NewsletterHelpPage locale={locale} about="yourData" />
        </Layout>
    );
}
