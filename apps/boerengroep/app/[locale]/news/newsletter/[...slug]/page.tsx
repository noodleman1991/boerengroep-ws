import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { mediaUrl, toNewsletterNode } from '@/lib/cms-adapters';
import { firstParagraph } from '@/lib/page-meta';
import { siteMeta } from '@/lib/site-meta';
import { forwardOrNotFound } from '@/lib/forward';
import { isOwnNews, newsItemPath } from '@/lib/news';
import NewsletterClientPage from './client-page';

export const revalidate = 3600;

const isMainOrganization = isOwnNews;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string[] }> }): Promise<Metadata> {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const item = await cms.getNewsletter(decodeURIComponent(slug[slug.length - 1]!), locale);
    if (!item) return {};
    return siteMeta(locale, {
        title: item.title,
        description: firstParagraph(item.excerpt) ?? item.linkDescription,
        path: newsItemPath(item),
        picture: mediaUrl(item.featuredImage, 'og'),
        type: 'article',
    });
}

export default async function NewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: Locale; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const newsletter = await cms.getNewsletter(decodeURIComponent(slug[slug.length - 1]!), locale);
    // An item that was removed may have a forwarding address.
    if (!newsletter || !isMainOrganization(newsletter.organization)) return forwardOrNotFound(locale, `/news/newsletter/${slug.join('/')}`);

    return (
        <Layout rawPageData={newsletter}>
            <NewsletterClientPage newsletter={toNewsletterNode(newsletter)} backPath="/news/newsletter" />
        </Layout>
    );
}

export async function generateStaticParams() {
    const newsletters = await cms.listNewsletters();
    return newsletters
        .filter((n) => isMainOrganization(n.organization))
        .flatMap((n) => (n.language ? [n.language] : ['en', 'nl']).map((locale) => ({ locale, slug: [n.slug] })));
}
