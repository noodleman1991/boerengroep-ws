import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConfirmedPage } from '@/components/newsletter/confirmed-page';
import Layout from '@/components/layout/layout';
import { SITE } from '@/site.config';

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'newsletter.verify' });

    return {
        title: `${t('confirmed_title')} - ${SITE.name}`,
        description: t('confirmed_message'),
    };
}

/** Where Brevo sends someone after they clicked the button in its confirmation email. */
export default async function Page({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <Layout rawPageData={{ data: { global: null } }}>
            <ConfirmedPage />
        </Layout>
    );
}
