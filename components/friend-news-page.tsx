'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { NewsletterList } from '@/components/newsletter-list';

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

interface FriendNewsPageProps {
    newsletters: NewsletterConnection;
    locale: string;
}

export const FriendNewsPage = ({ newsletters, locale }: FriendNewsPageProps) => {
    const t = useTranslations('newsletter');

    return (
        <NewsletterList
            newsletters={newsletters}
            locale={locale}
            filter="friends"
            title={t('filters.friends')}
            description="News and updates from our partner organizations and friends in the sustainable agriculture community."
        />
    );
};
