#!/bin/bash

# Podcast Feature Implementation Script
# This script implements the complete podcast feature for the Next.js app

set -e  # Exit on any error

echo "🎧 Starting Podcast Feature Implementation..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from your project root."
    exit 1
fi

print_info "Current directory: $(pwd)"

# Step 1: Install required packages
echo
print_info "Step 1: Installing required packages with pnpm..."
pnpm add react-h5-audio-player fast-xml-parser date-fns
pnpm dlx shadcn@latest add progress separator --yes
print_status "Packages installed successfully"

# Step 2: Create directories
echo
print_info "Step 2: Creating directories..."
mkdir -p app/api/podcast
mkdir -p app/[locale]/library/podcast
mkdir -p components/podcast
print_status "Directories created"

# Step 3: Create API route
echo
print_info "Step 3: Creating API route..."
cat > app/api/podcast/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Replace with your actual RSS feed URL
    const rssUrl = process.env.PODCAST_RSS_URL || 'https://anchor.fm/s/your-podcast-id/podcast/rss';
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false
    });

    const feedData = parser.parse(xmlText);
    const podcast = transformPodcastData(feedData, limit, offset);

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Podcast API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast data' },
      { status: 500 }
    );
  }
}

function transformPodcastData(feedData: any, limit = 10, offset = 0) {
  const channel = feedData.rss?.channel;

  if (!channel) {
    throw new Error('Invalid RSS feed structure');
  }

  // Handle both single item and array of items
  let items: any[] = [];
  if (channel.item) {
    items = Array.isArray(channel.item) ? channel.item : [channel.item];
  }

  // Sort by publication date (newest first)
  const sortedItems = items.sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  const paginatedItems = sortedItems.slice(offset, offset + limit);

  return {
    title: channel.title || 'Podcast',
    description: channel.description || '',
    image: channel['itunes:image']?.['@_href'] ||
           channel.image?.url ||
           channel.image?.['@_href'] || '',
    author: channel['itunes:author'] || '',
    link: channel.link || '',
    language: channel.language || 'en',
    totalEpisodes: items.length,
    hasMore: offset + limit < items.length,
    episodes: paginatedItems.map((item, index) => ({
      id: item.guid?.['#text'] || item.guid || `episode-${offset + index}`,
      title: item.title || 'Untitled Episode',
      description: cleanDescription(item.description),
      audioUrl: item.enclosure?.['@_url'] || '',
      audioType: item.enclosure?.['@_type'] || 'audio/mpeg',
      audioLength: parseInt(item.enclosure?.['@_length']) || 0,
      duration: item['itunes:duration'] || '',
      pubDate: new Date(item.pubDate),
      image: item['itunes:image']?.['@_href'] ||
             channel['itunes:image']?.['@_href'] || '',
      episodeNumber: item['itunes:episode'] || '',
      seasonNumber: item['itunes:season'] || '',
      episodeType: item['itunes:episodeType'] || 'full',
      explicit: item['itunes:explicit'] === 'true',
      spotifyUrl: generateSpotifyUrl(item.title),
      applePodcastsUrl: generateAppleUrl(item.title)
    }))
  };
}

function cleanDescription(description: any): string {
  if (!description) return '';

  let text = typeof description === 'string' ? description : String(description);

  return text
    .replace(/<!\[CDATA\[/, '')
    .replace(/\]\]>/, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function generateSpotifyUrl(title: string): string {
  // Basic implementation - you might want to use actual Spotify API or database mapping
  const query = encodeURIComponent(title || '');
  return `https://open.spotify.com/search/${query}`;
}

function generateAppleUrl(title: string): string {
  // Basic implementation - you might want to use actual Apple Podcasts API or database mapping
  const query = encodeURIComponent(title || '');
  return `https://podcasts.apple.com/search?term=${query}`;
}
EOF
print_status "API route created"

# Step 4: Create podcast components
echo
print_info "Step 4: Creating podcast components..."

# Podcast Player Component
cat > components/podcast/podcast-player.tsx << 'EOF'
'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, nl } from 'date-fns/locale';

const dateLocales = { en: enUS, nl: nl };

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  audioType: string;
  audioLength: number;
  duration: string;
  pubDate: Date;
  image: string;
  episodeNumber: string;
  seasonNumber: string;
  episodeType: string;
  explicit: boolean;
  spotifyUrl: string;
  applePodcastsUrl: string;
}

interface PodcastPlayerProps {
  episodes: Episode[];
  locale?: string;
  currentEpisode?: Episode | null;
  currentIndex?: number;
  onEpisodeSelect?: (episode: Episode, index: number) => void;
}

export function PodcastPlayer({
  episodes,
  locale = 'en',
  currentEpisode = null,
  currentIndex = -1,
  onEpisodeSelect
}: PodcastPlayerProps) {
  const t = useTranslations('podcast');
  const playerRef = useRef<any>(null);

  const handleClickPrevious = useCallback(() => {
    if (currentIndex > 0 && onEpisodeSelect) {
      const prevEpisode = episodes[currentIndex - 1];
      onEpisodeSelect(prevEpisode, currentIndex - 1);
    }
  }, [currentIndex, episodes, onEpisodeSelect]);

  const handleClickNext = useCallback(() => {
    if (currentIndex < episodes.length - 1 && onEpisodeSelect) {
      const nextEpisode = episodes[currentIndex + 1];
      onEpisodeSelect(nextEpisode, currentIndex + 1);
    }
  }, [currentIndex, episodes, onEpisodeSelect]);

  const handlePlayError = useCallback((error: any) => {
    console.error('Audio play error:', error);
  }, []);

  // MSE configuration for future streaming capabilities
  const mseConfig = currentEpisode?.audioLength ? {
    srcDuration: currentEpisode.audioLength / 1000,
    onSeek: (event: any) => {
      console.log('Seek event:', event);
    },
    onEncrypted: (event: any) => {
      console.log('Encrypted media detected:', event);
    }
  } : undefined;

  // i18n aria labels
  const i18nAriaLabels = {
    play: t('player.play'),
    pause: t('player.pause'),
    rewind: t('player.rewind'),
    forward: t('player.forward'),
    previous: t('player.previous'),
    next: t('player.next'),
    volumeMute: t('player.mute'),
    volumeUnmute: t('player.unmute'),
    volume: t('player.volume'),
    currentTime: t('player.currentTime'),
    duration: t('player.duration'),
    progressBar: t('player.progressBar')
  };

  return (
    <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-6">
        {currentEpisode ? (
          <div className="space-y-4">
            {/* Episode Info */}
            <div className="flex items-center space-x-4">
              {currentEpisode.image && (
                <img
                  src={currentEpisode.image}
                  alt={currentEpisode.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{currentEpisode.title}</h3>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  {currentEpisode.duration && (
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentEpisode.duration}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(currentEpisode.pubDate, {
                      addSuffix: true,
                      locale: dateLocales[locale as keyof typeof dateLocales]
                    })}
                  </span>
                  {currentEpisode.explicit && (
                    <Badge variant="destructive" className="text-xs">
                      {t('explicit')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Audio Player */}
            <AudioPlayer
              ref={playerRef}
              src={currentEpisode.audioUrl}
              showSkipControls={episodes.length > 1}
              showJumpControls={true}
              showDownloadProgress={true}
              showFilledProgress={true}
              showFilledVolume={false}
              autoPlay={false}
              autoPlayAfterSrcChange={true}
              volumeJumpStep={0.1}
              progressJumpSteps={{ backward: 10000, forward: 30000 }}
              progressUpdateInterval={100}
              listenInterval={1000}
              timeFormat="auto"
              i18nAriaLabels={i18nAriaLabels}
              onClickPrevious={handleClickPrevious}
              onClickNext={handleClickNext}
              onPlayError={handlePlayError}
              customAdditionalControls={[]}
              layout="horizontal"
              className="[&_.rhap_container]:bg-transparent [&_.rhap_main]:flex-col [&_.rhap_main]:gap-2"
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('selectEpisode')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
EOF

# Episode List Component
cat > components/podcast/episode-list.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, ExternalLink, Loader2, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, nl } from 'date-fns/locale';

const dateLocales = { en: enUS, nl: nl };

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  audioType: string;
  audioLength: number;
  duration: string;
  pubDate: Date;
  image: string;
  episodeNumber: string;
  seasonNumber: string;
  episodeType: string;
  explicit: boolean;
  spotifyUrl: string;
  applePodcastsUrl: string;
}

interface EpisodeListProps {
  initialEpisodes: Episode[];
  totalEpisodes: number;
  hasMore: boolean;
  onEpisodeSelect: (episode: Episode, index: number) => void;
  locale?: string;
}

export function EpisodeList({
  initialEpisodes,
  totalEpisodes,
  hasMore,
  onEpisodeSelect,
  locale = 'en'
}: EpisodeListProps) {
  const t = useTranslations('podcast');
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);

  const loadMoreEpisodes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/podcast?limit=6&offset=${episodes.length}`);
      if (!response.ok) throw new Error('Failed to fetch more episodes');

      const data = await response.json();

      setEpisodes(prev => [...prev, ...data.episodes]);
      setCanLoadMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load more episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Episode Count */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <Badge variant="secondary" className="text-sm">
          {t('episodeCount', { count: episodes.length, total: totalEpisodes })}
        </Badge>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {episodes.map((episode, index) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            episodeNumber={episodes.length - index}
            onPlay={() => onEpisodeSelect(episode, index)}
            locale={locale}
          />
        ))}
      </div>

      {/* Load More Button */}
      {canLoadMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={loadMoreEpisodes}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface EpisodeCardProps {
  episode: Episode;
  episodeNumber: number;
  onPlay: () => void;
  locale: string;
}

function EpisodeCard({ episode, episodeNumber, onPlay, locale }: EpisodeCardProps) {
  const t = useTranslations('podcast');

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              <span className="line-clamp-2">
                {episode.title}
              </span>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(episode.pubDate, {
                  addSuffix: true,
                  locale: dateLocales[locale as keyof typeof dateLocales]
                })}
              </span>
              {episode.duration && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {episode.duration}
                </span>
              )}
              {episode.explicit && (
                <Badge variant="destructive" className="text-xs">
                  {t('explicit')}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            #{episodeNumber}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-4">
          {/* Episode Thumbnail */}
          {episode.image && (
            <div className="shrink-0 hidden sm:block">
              <img
                src={episode.image}
                alt={episode.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-3">
            {/* Description Preview */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="line-clamp-2">
                {episode.description}
              </span>
            </p>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={onPlay}
                className="min-w-[120px]"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('playEpisode')}
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href={episode.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[100px]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('openInSpotify')}
                </a>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href={episode.applePodcastsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[100px]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('openInApple')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

# Podcast Header Component
cat > components/podcast/podcast-header.tsx << 'EOF'
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Rss } from 'lucide-react';

interface PodcastData {
  title: string;
  description: string;
  image: string;
  author: string;
  link: string;
  language: string;
  totalEpisodes: number;
}

interface PodcastHeaderProps {
  podcast: PodcastData;
  locale: string;
}

export function PodcastHeader({ podcast, locale }: PodcastHeaderProps) {
  const t = useTranslations('podcast');

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Podcast Artwork */}
          {podcast.image && (
            <div className="shrink-0">
              <img
                src={podcast.image}
                alt={podcast.title}
                className="w-48 h-48 rounded-lg object-cover mx-auto md:mx-0 shadow-lg"
              />
            </div>
          )}

          {/* Podcast Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
              {podcast.author && (
                <p className="text-lg text-muted-foreground">
                  {t('hostedBy')} {podcast.author}
                </p>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {podcast.description}
            </p>

            {/* Podcast Stats */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {t('episodeCount', { count: podcast.totalEpisodes, total: podcast.totalEpisodes })}
              </Badge>
              <Badge variant="outline">
                {podcast.language?.toUpperCase() || locale.toUpperCase()}
              </Badge>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {podcast.link && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={podcast.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('visitWebsite')}
                  </a>
                </Button>
              )}

              <Button variant="outline" size="sm" asChild>
                <a
                  href="/api/podcast"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Rss className="w-4 h-4 mr-2" />
                  {t('rssFeed')}
                </a>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(podcast.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('onSpotify')}
                </a>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://podcasts.apple.com/search?term=${encodeURIComponent(podcast.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('onApple')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
EOF

print_status "Podcast components created"

# Step 5: Create page files
echo
print_info "Step 5: Creating page files..."

# Client Page Component
cat > app/[locale]/library/podcast/client-page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { PodcastPlayer } from '@/components/podcast/podcast-player';
import { EpisodeList } from '@/components/podcast/episode-list';
import { PodcastHeader } from '@/components/podcast/podcast-header';

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  audioType: string;
  audioLength: number;
  duration: string;
  pubDate: Date;
  image: string;
  episodeNumber: string;
  seasonNumber: string;
  episodeType: string;
  explicit: boolean;
  spotifyUrl: string;
  applePodcastsUrl: string;
}

interface PodcastData {
  title: string;
  description: string;
  image: string;
  author: string;
  link: string;
  language: string;
  totalEpisodes: number;
  hasMore: boolean;
  episodes: Episode[];
}

interface PodcastClientPageProps {
  podcast: PodcastData;
  locale: string;
}

export function PodcastClientPage({ podcast, locale }: PodcastClientPageProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleEpisodeSelect = (episode: Episode, index: number) => {
    setSelectedEpisode(episode);
    setSelectedIndex(index);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Podcast Header */}
      <PodcastHeader podcast={podcast} locale={locale} />

      {/* Audio Player - Sticky */}
      <div className="sticky top-4 z-10 mb-8">
        <PodcastPlayer
          episodes={podcast.episodes}
          locale={locale}
          currentEpisode={selectedEpisode}
          currentIndex={selectedIndex}
          onEpisodeSelect={handleEpisodeSelect}
        />
      </div>

      {/* Episode List with Load More */}
      <EpisodeList
        initialEpisodes={podcast.episodes}
        totalEpisodes={podcast.totalEpisodes}
        hasMore={podcast.hasMore}
        onEpisodeSelect={handleEpisodeSelect}
        locale={locale}
      />
    </div>
  );
}
EOF

# Main Page
cat > app/[locale]/library/podcast/page.tsx << 'EOF'
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Layout from '@/components/layout/layout';
import { Section } from '@/components/layout/section';
import { PodcastClientPage } from './client-page';

interface PodcastPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PodcastPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'podcast' });

    return {
        title: `${t('title')} - Stichting Boerengroep`,
        description: t('description'),
    };
}

async function fetchPodcastData(limit = 6, offset = 0) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const url = new URL('/api/podcast', baseUrl);
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('offset', offset.toString());

        const response = await fetch(url.toString(), {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch podcast data');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching podcast data:', error);
        return {
            title: 'Podcast',
            description: 'Welcome to our podcast',
            image: '',
            author: '',
            link: '',
            language: 'en',
            totalEpisodes: 0,
            hasMore: false,
            episodes: []
        };
    }
}

export default async function PodcastPage({ params }: PodcastPageProps) {
    const { locale } = await params;
    const podcast = await fetchPodcastData(6);

    // Mock layout data for the Layout component
    const mockLayoutData = {
        data: {
            global: null // This will be fetched by the Layout component itself
        }
    };

    return (
        <Layout rawPageData={mockLayoutData}>
            <Section>
                <PodcastClientPage
                    podcast={podcast}
                    locale={locale}
                />
            </Section>
        </Layout>
    );
}
EOF

print_status "Page files created"

# Step 6: Update existing translation files
echo
print_info "Step 6: Updating translation files..."

# Update English translations
print_info "Updating messages/en.json..."
if [ -f "messages/en.json" ]; then
    # Create a backup
    cp messages/en.json messages/en.json.backup

    # Use Node.js to merge JSON files
    node -e "
    const fs = require('fs');
    const existing = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

    const podcastTranslations = {
      'podcast': {
        'title': 'Latest Episodes',
        'description': 'Listen to our podcast episodes covering sustainable agriculture, community initiatives, and inspiring stories.',
        'playEpisode': 'Play Episode',
        'loadMore': 'Load More Episodes',
        'episodeCount': '{count} of {total} episodes',
        'publishedOn': 'Published {date}',
        'duration': 'Duration',
        'explicit': 'Explicit',
        'openInSpotify': 'Open in Spotify',
        'openInApple': 'Open in Apple Podcasts',
        'selectEpisode': 'Select an episode to start playing',
        'loading': 'Loading...',
        'hostedBy': 'Hosted by',
        'visitWebsite': 'Visit Website',
        'rssFeed': 'RSS Feed',
        'onSpotify': 'On Spotify',
        'onApple': 'On Apple Podcasts',
        'player': {
          'play': 'Play',
          'pause': 'Pause',
          'rewind': 'Rewind',
          'forward': 'Forward',
          'previous': 'Previous',
          'next': 'Next',
          'mute': 'Mute',
          'unmute': 'Unmute',
          'volume': 'Volume',
          'currentTime': 'Current time',
          'duration': 'Duration',
          'progressBar': 'Audio progress'
        }
      }
    };

    const merged = { ...existing, ...podcastTranslations };
    fs.writeFileSync('messages/en.json', JSON.stringify(merged, null, 2));
    "
    print_status "English translations updated"
else
    print_warning "messages/en.json not found, skipping English translations"
fi

# Update Dutch translations
print_info "Updating messages/nl.json..."
if [ -f "messages/nl.json" ]; then
    # Create a backup
    cp messages/nl.json messages/nl.json.backup

    # Use Node.js to merge JSON files
    node -e "
    const fs = require('fs');
    const existing = JSON.parse(fs.readFileSync('messages/nl.json', 'utf8'));

    const podcastTranslations = {
      'podcast': {
        'title': 'Nieuwste Afleveringen',
        'description': 'Luister naar onze podcast afleveringen over duurzame landbouw, gemeenschapsinitiatieven en inspirerende verhalen.',
        'playEpisode': 'Aflevering Afspelen',
        'loadMore': 'Meer Afleveringen Laden',
        'episodeCount': '{count} van {total} afleveringen',
        'publishedOn': 'Gepubliceerd {date}',
        'duration': 'Duur',
        'explicit': 'Expliciete Inhoud',
        'openInSpotify': 'Openen in Spotify',
        'openInApple': 'Openen in Apple Podcasts',
        'selectEpisode': 'Selecteer een aflevering om te beginnen met afspelen',
        'loading': 'Laden...',
        'hostedBy': 'Gepresenteerd door',
        'visitWebsite': 'Bezoek Website',
        'rssFeed': 'RSS Feed',
        'onSpotify': 'Op Spotify',
        'onApple': 'Op Apple Podcasts',
        'player': {
          'play': 'Afspelen',
          'pause': 'Pauzeren',
          'rewind': 'Terugspoelen',
          'forward': 'Vooruitspoelen',
          'previous': 'Vorige',
          'next': 'Volgende',
          'mute': 'Dempen',
          'unmute': 'Demping Opheffen',
          'volume': 'Volume',
          'currentTime': 'Huidige tijd',
          'duration': 'Duur',
          'progressBar': 'Audio voortgang'
        }
      }
    };

    const merged = { ...existing, ...podcastTranslations };
    fs.writeFileSync('messages/nl.json', JSON.stringify(merged, null, 2));
    "
    print_status "Dutch translations updated"
else
    print_warning "messages/nl.json not found, skipping Dutch translations"
fi

# Step 7: Update CSS file
echo
print_info "Step 7: Updating CSS file..."

CSS_FILE="app/[locale]/globals.css"
if [ -f "$CSS_FILE" ]; then
    # Create a backup
    cp "$CSS_FILE" "$CSS_FILE.backup"

    # Add podcast CSS styles
    cat >> "$CSS_FILE" << 'EOF'

/* React H5 Audio Player Custom Styles */
.rhap_container {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

.rhap_main {
  flex-direction: column !important;
  gap: 0.5rem !important;
}

.rhap_controls-section {
  margin: 0 !important;
}

.rhap_additional-controls {
  margin: 0 !important;
}

.rhap_progress-section {
  margin: 0.5rem 0 !important;
  flex: 1 !important;
}

.rhap_volume-controls {
  margin: 0 !important;
}

/* Button styling to match the app theme */
.rhap_button-clear {
  background-color: hsl(var(--background)) !important;
  color: hsl(var(--foreground)) !important;
  border: 1px solid hsl(var(--border)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
  transition: all 0.2s ease !important;
}

.rhap_button-clear:hover {
  background-color: hsl(var(--accent)) !important;
  color: hsl(var(--accent-foreground)) !important;
}

.rhap_button-clear:focus {
  outline: 2px solid hsl(var(--ring)) !important;
  outline-offset: 2px !important;
}

/* Play/pause button styling */
.rhap_play-pause-button {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  border: none !important;
  width: 3rem !important;
  height: 3rem !important;
}

.rhap_play-pause-button:hover {
  background-color: hsl(var(--primary)) !important;
  opacity: 0.9 !important;
}

/* Progress bar styling */
.rhap_progress-bar {
  background-color: hsl(var(--muted)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
  height: 0.375rem !important;
}

.rhap_progress-filled {
  background-color: hsl(var(--primary)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
}

.rhap_progress-indicator {
  background-color: hsl(var(--primary)) !important;
  border: 2px solid hsl(var(--background)) !important;
  width: 1rem !important;
  height: 1rem !important;
  top: -0.3125rem !important;
}

/* Volume bar styling */
.rhap_volume-bar {
  background-color: hsl(var(--muted)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
}

.rhap_volume-filled {
  background-color: hsl(var(--primary)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
}

.rhap_volume-indicator {
  background-color: hsl(var(--primary)) !important;
  border: 2px solid hsl(var(--background)) !important;
  width: 0.75rem !important;
  height: 0.75rem !important;
}

/* Time display styling */
.rhap_time {
  color: hsl(var(--muted-foreground)) !important;
  font-size: 0.875rem !important;
  font-family: var(--font-sans) !important;
}

/* Download progress styling */
.rhap_download-progress {
  background-color: hsl(var(--muted)) !important;
  border-radius: calc(var(--radius) - 2px) !important;
  opacity: 0.6 !important;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .rhap_button-clear {
    background-color: hsl(var(--background)) !important;
    border-color: hsl(var(--border)) !important;
  }

  .rhap_button-clear:hover {
    background-color: hsl(var(--accent)) !important;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rhap_controls-section {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  .rhap_main-controls {
    justify-content: center !important;
  }

  .rhap_volume-controls {
    justify-content: center !important;
  }
}
EOF
    print_status "CSS file updated"
else
    print_warning "CSS file not found at $CSS_FILE"
fi

# Step 8: Create environment variables template
echo
print_info "Step 8: Creating environment variables..."

if [ ! -f ".env.local" ]; then
    touch .env.local
fi

# Check if podcast variables already exist
if ! grep -q "PODCAST_RSS_URL" .env.local; then
    echo "" >> .env.local
    echo "# Podcast Configuration" >> .env.local
    echo "PODCAST_RSS_URL=https://anchor.fm/s/your-podcast-id/podcast/rss" >> .env.local
    print_status "PODCAST_RSS_URL added to .env.local"
else
    print_info "PODCAST_RSS_URL already exists in .env.local"
fi

if ! grep -q "NEXT_PUBLIC_BASE_URL" .env.local; then
    echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" >> .env.local
    print_status "NEXT_PUBLIC_BASE_URL added to .env.local"
else
    print_info "NEXT_PUBLIC_BASE_URL already exists in .env.local"
fi

# Step 9: Final verification
echo
print_info "Step 9: Verifying installation..."

# Check if all files were created
files_to_check=(
    "app/api/podcast/route.ts"
    "app/[locale]/library/podcast/page.tsx"
    "app/[locale]/library/podcast/client-page.tsx"
    "components/podcast/podcast-player.tsx"
    "components/podcast/episode-list.tsx"
    "components/podcast/podcast-header.tsx"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "✓ $file"
    else
        print_error "✗ $file"
        all_files_exist=false
    fi
done

# Final summary
echo
echo "================================================"
if [ "$all_files_exist" = true ]; then
    print_status "🎉 Podcast feature implementation completed successfully!"
    echo
    print_info "Next steps:"
    echo "1. Update PODCAST_RSS_URL in .env.local with your actual RSS feed"
    echo "2. Start your development server: pnpm dev"
    echo "3. Navigate to /library/podcast (English) or /bibliotheek/podcast (Dutch)"
    echo "4. Test the podcast functionality"
    echo
    print_info "The podcast page is already integrated into your navigation menu!"
    print_info "Route: Library & Media > Podcast"
else
    print_error "Some files were not created successfully. Please check the output above."
    exit 1
fi

echo "================================================"
print_status "Implementation script completed!"
