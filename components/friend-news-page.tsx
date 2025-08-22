'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Calendar, Building } from 'lucide-react';

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
    excerpt?: any; // Rich text content
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

interface FriendNewsPageProps {
    newsletters: NewsletterConnection;
    locale: string;
}

export const FriendNewsPage = ({ newsletters, locale }: FriendNewsPageProps) => {
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

    // Filter for published friend newsletters (excluding Boerengroep and Inspiratietheater)
    const friendNews = newsletters.edges?.filter(edge => {
        const node = edge?.node;
        return node?.published &&
            node.organization &&
            node.organization !== 'Boerengroep' &&
            node.organization !== 'Inspiratietheater';
    }) || [];

    return (
        <Section>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        {t('filters.friends')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        News and updates from our partner organizations and friends in the sustainable agriculture community.
                    </p>
                </div>

                {/* Friend News Grid */}
                {friendNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {friendNews.map((edge) => {
                            const news = edge?.node;
                            if (!news) return null;

                            const isExternal = news.type === 'link';
                            const href = isExternal
                                ? news.externalLink!
                                : `/${locale}/newsletters/${news._sys.breadcrumbs.slice(1).join('/')}`;

                            return (
                                <Card key={news.id} className="h-full hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Building className="h-3 w-3" />
                                                {news.organization}
                                            </Badge>
                                            <Badge variant="outline">
                                                {t(`types.${news.type}`) || news.type}
                                            </Badge>
                                        </div>

                                        <CardTitle className="line-clamp-2 text-lg">
                                            {isExternal ? (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-2"
                                                >
                                                    {news.title}
                                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                                </a>
                                            ) : (
                                                <Link href={href} className="hover:underline">
                                                    {news.title}
                                                </Link>
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {news.linkDescription && (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {news.linkDescription}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {news.publishDate && formatDate(news.publishDate)}
                                                </span>
                                            </div>

                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                {isExternal ? (
                                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                                        {t('visit_link') || 'Visit Link'}
                                                        <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <Link href={href}>
                                                        {t('read_more') || 'Read More'}
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
                            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Friend News Yet</h3>
                            <p className="text-muted-foreground">
                                {t('no_newsletters') || 'No newsletters from partner organizations are currently available.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Section>
    );
};
