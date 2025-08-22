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
}

export default function NewsletterClientPage(props: ClientNewsletterProps) {
  const { theme } = useLayout();
  const { data } = useTina({ ...props });
  const newsletter = data.newsletter;
  const t = useTranslations('newsletter');

  const date = new Date(newsletter.publishDate!);
  let formattedDate = '';
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, 'MMM dd, yyyy');
  }

  const titleColour = titleColorClasses[theme!.color! as keyof typeof titleColorClasses];

  // Determine back link based on organization
  const backLink = newsletter.organization === 'Boerengroep' || newsletter.organization === 'Inspiratietheater'
    ? '/news/newsletter'
    : '/news/friends-news';

  // If this is an external link, show a redirect message
  if (newsletter.type === 'link' && newsletter.externalLink) {
    return (
      <ErrorBoundary>
        <Section>
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link href={backLink as any}>
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
            <Link href={backLink as any}>
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
