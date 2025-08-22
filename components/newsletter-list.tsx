'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Calendar } from 'lucide-react';
import Image from 'next/image';

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
    featuredImage?: string | null;
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
                                <Card key={newsletter.id} className="h-full hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                                    {/* Featured Image or Placeholder */}
                                    <div className="relative w-full aspect-video overflow-hidden group bg-muted">
                                        {newsletter.featuredImage ? (
                                            <Image
                                                src={newsletter.featuredImage}
                                                alt={newsletter.title || 'Newsletter image'}
                                                fill
                                                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : null}
                                    </div>

                                    <CardHeader className="flex-shrink-0">
                                        <div className="flex items-center justify-between mb-3">
                                            {/*<Badge variant="secondary">*/}
                                            {/*    {newsletter.organization}*/}
                                            {/*</Badge> //todo: friend org name*/}
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

                                    <CardContent className="flex flex-col flex-1">
                                        <div className="flex-1 space-y-4">
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
                                        </div>

                                        <div className="mt-4 pt-4">
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
