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
    const t = await getTranslations({ locale, namespace: 'newsletter.unsubscribe' });

    return {
        title: `${t('title')} - ${SITE.name}`,
        description: t('description'),
    };
}

/** How to leave the newsletter: through the link at the bottom of every newsletter. */
export default async function Page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <Layout rawPageData={{ data: { global: null } }}>
            <NewsletterHelpPage locale={locale} about="unsubscribe" />
        </Layout>
    );
}
