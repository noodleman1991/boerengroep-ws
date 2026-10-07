import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { toNewsletterNode } from '@/lib/cms-adapters';
import NewsletterClientPage from './client-page';

export const revalidate = 3600;

// Kept from the previous implementation, including the 'Inspiratietheater' spelling.
const isMainOrganization = (organization: string) =>
    organization === 'Boerengroep' || organization === 'Inspiratietheater';

export default async function FriendsNewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: Locale; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const newsletter = await cms.getNewsletter(decodeURIComponent(slug[slug.length - 1]!), locale);
    if (!newsletter || isMainOrganization(newsletter.organization)) notFound();

    return (
        <Layout rawPageData={newsletter}>
            <NewsletterClientPage newsletter={toNewsletterNode(newsletter)} backPath="/news/friends-news" />
        </Layout>
    );
}

export async function generateStaticParams() {
    const newsletters = await cms.listNewsletters();
    return newsletters
        .filter((n) => !isMainOrganization(n.organization))
        .flatMap((n) => (n.language ? [n.language] : ['en', 'nl']).map((locale) => ({ locale, slug: [n.slug] })));
}
