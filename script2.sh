#!/bin/bash

# Newsletter Path Refactoring Script
# Changes:
# OLD: /newsletters/[...urlSegments]
# NEW: /news/newsletter/[...slug] AND /news/friends-news/[...slug]

echo "🔄 Refactoring newsletter paths..."

# Step 1: Create new directory structure
echo "📁 Step 1: Creating new directory structure..."
mkdir -p app/\[locale\]/news/newsletter/\[...slug\]
mkdir -p app/\[locale\]/news/friends-news/\[...slug\]

# Step 2: Create newsletter detail page (handles both main newsletters)
echo "📝 Step 2: Creating newsletter detail page..."
cat > app/\[locale\]/news/newsletter/\[...slug\]/page.tsx << 'EOF'
import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import NewsletterClientPage from './client-page';

export const revalidate = 300;

export default async function NewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    const filepath = slug.join('/');

    let data;
    try {
        // Try locale-specific newsletter first
        data = await client.queries.newsletter({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized newsletter
        try {
            data = await client.queries.newsletter({
                relativePath: `${filepath}.mdx`,
            });
        } catch (fallbackError) {
            notFound();
        }
    }

    // Verify this newsletter belongs to main organizations
    const newsletter = data.data.newsletter;
    if (newsletter.organization !== 'Boerengroep' && newsletter.organization !== 'Inspiratietheater') {
        notFound();
    }

    return (
        <Layout rawPageData={data}>
            <NewsletterClientPage {...data} backPath="/news/newsletter" />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en'];
    let newsletters = await client.queries.newsletterConnection();
    const allNewsletters = newsletters;

    if (!allNewsletters.data.newsletterConnection.edges) {
        return [];
    }

    while (newsletters.data?.newsletterConnection.pageInfo.hasNextPage) {
        newsletters = await client.queries.newsletterConnection({
            after: newsletters.data.newsletterConnection.pageInfo.endCursor,
        });

        if (!newsletters.data.newsletterConnection.edges) {
            break;
        }

        allNewsletters.data.newsletterConnection.edges.push(...newsletters.data.newsletterConnection.edges);
    }

    const params: { locale: string; slug: string[] }[] = [];

    allNewsletters.data?.newsletterConnection.edges.forEach((edge) => {
        const newsletter = edge?.node;
        if (!newsletter?.organization) return;

        // Only include main organizations
        if (newsletter.organization !== 'Boerengroep' && newsletter.organization !== 'Inspiratietheater') {
            return;
        }

        const breadcrumbs = newsletter._sys.breadcrumbs || [];

        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            const locale = breadcrumbs[0];
            const slug = breadcrumbs.slice(1);

            if (slug.length >= 1) {
                params.push({ locale, slug });
            }
        } else {
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, slug: breadcrumbs });
                });
            }
        }
    });

    return params;
}
EOF

# Step 3: Create friends newsletter detail page
echo "📝 Step 3: Creating friends newsletter detail page..."
cat > app/\[locale\]/news/friends-news/\[...slug\]/page.tsx << 'EOF'
import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import NewsletterClientPage from './client-page';

export const revalidate = 300;

export default async function FriendsNewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    const filepath = slug.join('/');

    let data;
    try {
        // Try locale-specific newsletter first
        data = await client.queries.newsletter({
            relativePath: `${locale}/${filepath}.mdx`,
        });
    } catch (error) {
        // Fallback to non-localized newsletter
        try {
            data = await client.queries.newsletter({
                relativePath: `${filepath}.mdx`,
            });
        } catch (fallbackError) {
            notFound();
        }
    }

    // Verify this newsletter belongs to friends organizations
    const newsletter = data.data.newsletter;
    if (newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater') {
        notFound();
    }

    return (
        <Layout rawPageData={data}>
            <NewsletterClientPage {...data} backPath="/news/friends-news" />
        </Layout>
    );
}

export async function generateStaticParams() {
    const locales = ['nl', 'en'];
    let newsletters = await client.queries.newsletterConnection();
    const allNewsletters = newsletters;

    if (!allNewsletters.data.newsletterConnection.edges) {
        return [];
    }

    while (newsletters.data?.newsletterConnection.pageInfo.hasNextPage) {
        newsletters = await client.queries.newsletterConnection({
            after: newsletters.data.newsletterConnection.pageInfo.endCursor,
        });

        if (!newsletters.data.newsletterConnection.edges) {
            break;
        }

        allNewsletters.data.newsletterConnection.edges.push(...newsletters.data.newsletterConnection.edges);
    }

    const params: { locale: string; slug: string[] }[] = [];

    allNewsletters.data?.newsletterConnection.edges.forEach((edge) => {
        const newsletter = edge?.node;
        if (!newsletter?.organization) return;

        // Only include friends organizations (exclude main orgs)
        if (newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater') {
            return;
        }

        const breadcrumbs = newsletter._sys.breadcrumbs || [];

        if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
            const locale = breadcrumbs[0];
            const slug = breadcrumbs.slice(1);

            if (slug.length >= 1) {
                params.push({ locale, slug });
            }
        } else {
            if (breadcrumbs.length >= 1) {
                locales.forEach(locale => {
                    params.push({ locale, slug: breadcrumbs });
                });
            }
        }
    });

    return params;
}
EOF

# Step 4: Create shared client page for newsletter details
echo "📝 Step 4: Creating shared newsletter client page..."
cat > app/\[locale\]/news/newsletter/\[...slug\]/client-page.tsx << 'EOF'
'use client';
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { NewsletterQuery } from '@/tina/__generated__/types';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { Blocks } from '@/components/blocks';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink, UserRound } from 'lucide-react';
import ErrorBoundary from '@/components/error-boundary';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const titleColorClasses = {
  blue: 'from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500',
  teal: 'from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500',
  green: 'from-green-400 to-green-600',
  red: 'from-red-400 to-red-600',
  pink: 'from-pink-300 to-pink-500',
  purple: 'from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500',
  orange: 'from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500',
  yellow: 'from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500',
};

interface ClientNewsletterProps {
  data: NewsletterQuery;
  variables: {
    relativePath: string;
  };
  query: string;
  backPath: string;
}

export default function NewsletterClientPage(props: ClientNewsletterProps) {
  const { theme } = useLayout();
  const { data, backPath } = props;
  const { data: tinaData } = useTina({ data: props.data, variables: props.variables, query: props.query });
  const newsletter = tinaData.newsletter;
  const t = useTranslations('newsletter');

  const date = new Date(newsletter.publishDate!);
  let formattedDate = '';
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy');
  }

  const titleColour = titleColorClasses[theme!.color! as keyof typeof titleColorClasses];

  // If this is an external link, show a redirect message
  if (newsletter.type === 'link' && newsletter.externalLink) {
    return (
      <ErrorBoundary>
        <Section>
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link href={backPath as any}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('back_to_newsletter')}
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Badge variant="outline" className="mb-4">
                  {newsletter.organization}
                </Badge>

                <h1 data-tina-field={tinaField(newsletter, 'title')} className="text-3xl font-bold">
                  {newsletter.title}
                </h1>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span data-tina-field={tinaField(newsletter, 'publishDate')}>
                    {formattedDate}
                  </span>
                </div>

                {newsletter.linkDescription && (
                  <p data-tina-field={tinaField(newsletter, 'linkDescription')} className="text-lg text-muted-foreground">
                    {newsletter.linkDescription}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This content is hosted externally. Click the button below to visit the original article.
                </p>

                <Button asChild size="lg">
                  <a
                    href={newsletter.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tina-field={tinaField(newsletter, 'externalLink')}
                  >
                    {t('visit_link')}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Section>
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href={backPath as any}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_newsletter')}
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge variant="secondary">
                {newsletter.organization}
              </Badge>
              <Badge variant="outline">
                {t(`types.${newsletter.type}`) || newsletter.type}
              </Badge>
            </div>

            <h1 data-tina-field={tinaField(newsletter, 'title')} className={`mb-8 text-4xl md:text-5xl font-extrabold tracking-normal text-center title-font`}>
              <span className={`bg-clip-text text-transparent bg-linear-to-r ${titleColour}`}>
                {newsletter.title}
              </span>
            </h1>

            {/* Author and Date */}
            <div data-tina-field={tinaField(newsletter, 'author')} className='flex items-center justify-center mb-8'>
              {newsletter.author && (
                <>
                  <Avatar className="mr-4">
                    {newsletter.author.avatar && (
                      <AvatarImage
                        data-tina-field={tinaField(newsletter.author, 'avatar')}
                        src={newsletter.author.avatar}
                        alt={newsletter.author.name}
                      />
                    )}
                    <AvatarFallback>
                      <UserRound size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p
                      data-tina-field={tinaField(newsletter.author, 'name')}
                      className='text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white'
                    >
                      {newsletter.author.name}
                    </p>
                    {newsletter.author.affiliation && (
                      <p
                        data-tina-field={tinaField(newsletter.author, 'affiliation')}
                        className='text-sm text-muted-foreground'
                      >
                        {newsletter.author.affiliation}
                      </p>
                    )}
                  </div>
                  <span className='font-bold text-gray-200 dark:text-gray-500 mx-4'>—</span>
                </>
              )}
              <div className="flex items-center gap-2 text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
                <Calendar className="h-4 w-4" />
                <p data-tina-field={tinaField(newsletter, 'publishDate')}>
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Featured Image */}
            {newsletter.featuredImage && (
              <div className='w-full mb-12'>
                <div data-tina-field={tinaField(newsletter, 'featuredImage')} className='relative max-w-4xl lg:max-w-5xl mx-auto'>
                  <Image
                    priority={true}
                    src={newsletter.featuredImage}
                    alt={newsletter.title || ''}
                    className='relative z-10 mx-auto block rounded-lg w-full h-auto opacity-100'
                    width={800}
                    height={400}
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* Excerpt */}
            {newsletter.excerpt && (
              <div data-tina-field={tinaField(newsletter, 'excerpt')} className='prose dark:prose-dark mx-auto mb-8 text-lg'>
                <TinaMarkdown content={newsletter.excerpt} />
              </div>
            )}
          </div>

          {/* Content Blocks */}
          {newsletter.body && newsletter.body.length > 0 && (
            <div data-tina-field={tinaField(newsletter, 'body')}>
              <Blocks blocks={newsletter.body as any} />
            </div>
          )}

          {/* Tags */}
          {newsletter.tags && newsletter.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Tags:</span>
                {newsletter.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </ErrorBoundary>
  );
}
EOF

# Step 5: Copy the same client page to friends-news
echo "📝 Step 5: Creating friends-news client page..."
cp app/\[locale\]/news/newsletter/\[...slug\]/client-page.tsx app/\[locale\]/news/friends-news/\[...slug\]/client-page.tsx

# Step 6: Update newsletter list component to use correct paths
echo "📝 Step 6: Updating newsletter list component..."
cat > components/newsletter-list.tsx << 'EOF'
'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Calendar } from 'lucide-react';

interface NewsletterNode {
    id: string;
    title?: string | null;
    type?: string | null;
    organization?: string | null;
    publishDate?: string | null;
    externalLink?: string | null;
    linkDescription?: string | null;
    published?: boolean | null;
    featured?: boolean | null;
    excerpt?: any;
    _sys: {
        breadcrumbs: string[];
    };
}

interface NewsletterEdge {
    node?: NewsletterNode | null;
}

interface NewsletterConnection {
    edges?: (NewsletterEdge | null)[] | null;
}

interface NewsletterListProps {
    newsletters: NewsletterConnection;
    locale: string;
    filter: 'main' | 'friends';
    title: string;
    description: string;
}

export const NewsletterList = ({ newsletters, locale, filter, title, description }: NewsletterListProps) => {
    const t = useTranslations('newsletter');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            locale === 'nl' ? 'nl-NL' : 'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );
    };

    // Filter newsletters based on the filter prop
    const filteredNewsletters = newsletters.edges?.filter(edge => {
        const node = edge?.node;
        if (!node?.published || !node.organization) return false;

        if (filter === 'main') {
            return node.organization === 'Boerengroep' || node.organization === 'Inspiratietheater';
        } else if (filter === 'friends') {
            return node.organization !== 'Boerengroep' && node.organization !== 'Inspiratietheater';
        }
        return false;
    }) || [];

    return (
        <Section>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>

                {/* Newsletter Grid */}
                {filteredNewsletters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNewsletters.map((edge) => {
                            const newsletter = edge?.node;
                            if (!newsletter) return null;

                            const isExternal = newsletter.type === 'link';

                            // Determine the correct path based on organization
                            const isMainOrg = newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater';
                            const basePath = isMainOrg ? '/news/newsletter' : '/news/friends-news';

                            const href = isExternal
                                ? newsletter.externalLink!
                                : `${basePath}/${newsletter._sys.breadcrumbs.slice(1).join('/')}` as any;

                            return (
                                <Card key={newsletter.id} className="h-full hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="secondary">
                                                {newsletter.organization}
                                            </Badge>
                                            <Badge variant="outline">
                                                {t(`types.${newsletter.type}`) || newsletter.type}
                                            </Badge>
                                        </div>

                                        <CardTitle className="line-clamp-2 text-lg">
                                            {isExternal ? (
                                                <a
                                                    href={href as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-2"
                                                >
                                                    {newsletter.title}
                                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                                </a>
                                            ) : (
                                                <Link href={href} className="hover:underline">
                                                    {newsletter.title}
                                                </Link>
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {newsletter.linkDescription && (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {newsletter.linkDescription}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {newsletter.publishDate && formatDate(newsletter.publishDate)}
                                                </span>
                                            </div>

                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                {isExternal ? (
                                                    <a href={href as string} target="_blank" rel="noopener noreferrer">
                                                        {t('visit_link')}
                                                        <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <Link href={href}>
                                                        {t('read_more')}
                                                    </Link>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-semibold mb-2">No Newsletters Yet</h3>
                            <p className="text-muted-foreground">
                                {t('no_newsletters')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};
EOF

# Step 7: Remove old newsletter directory structure
echo "🗑️  Step 7: Removing old newsletter directory structure..."
rm -rf app/\[locale\]/newsletters 2>/dev/null || true

echo "✅ Newsletter path refactoring complete!"
echo ""
echo "📋 Changes made:"
echo "   1. ✅ Created /news/newsletter/[...slug] for main newsletter details"
echo "   2. ✅ Created /news/friends-news/[...slug] for friends newsletter details"
echo "   3. ✅ Updated newsletter list component to link to correct paths"
echo "   4. ✅ Updated client components with proper back navigation"
echo "   5. ✅ Added organization filtering to ensure correct routing"
echo "   6. ✅ Removed old /newsletters directory structure"
echo ""
echo "🎯 New URL structure:"
echo "   - /news/newsletter → Main newsletter listing"
echo "   - /news/newsletter/[slug] → Individual main newsletter"
echo "   - /news/friends-news → Friends newsletter listing"
echo "   - /news/friends-news/[slug] → Individual friends newsletter"
echo ""
echo "All paths are now logically organized under their respective sections!"
