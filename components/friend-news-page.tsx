'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { format } from 'date-fns';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface NewsletterNode {
    id: string;
    title?: string | null;
    type?: string | null;
    organization?: string | null;
    publishDate?: string | null;
    externalLink?: string | null;
    linkDescription?: string | null;
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

    const friendNews = newsletters.edges?.filter(edge => edge?.node?.published) || [];

    return (
        <Section>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold">{t('filters.friends')}</h1>
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
                                <Card key={news.id} className="h-full">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary">{news.organization}</Badge>
                                            <Badge variant="outline">{t(`types.${news.type}`)}</Badge>
                                        </div>

                                        <CardTitle className="line-clamp-2">
                                            {isExternal ? (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-2"
                                                >
                                                    {news.title}
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            ) : (
                                                <Link href={href} className="hover:underline">
                                                    {news.title}
                                                </Link>
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3">
                                            {news.linkDescription && (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {news.linkDescription}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {news.publishDate && formatDate(news.publishDate)}
                                                </span>
                                            </div>

                                            <Button asChild variant="outline" size="sm" className="w-full">
                                                {isExternal ? (
                                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                                        {t('visit_link')}
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
                        <p className="text-muted-foreground">{t('no_newsletters')}</p>
                    </div>
                )}
            </div>
        </Section>
    );
};
