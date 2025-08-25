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
      ... { parseTrueNumberOnly: false as any } // todo:  X2jOptions type fixes
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
