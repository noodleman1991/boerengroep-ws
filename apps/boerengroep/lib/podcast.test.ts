import { describe, expect, it } from 'vitest'
import { parsePodcastFeed, pickEpisodes } from './podcast'

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
  <channel>
    <title>Boerengroep Podcast</title>
    <description><![CDATA[<p>Stories from the <b>field</b>.</p>]]></description>
    <link>https://example.org/podcast</link>
    <language>nl</language>
    <itunes:author>Stichting Boerengroep</itunes:author>
    <itunes:image href="https://example.org/cover.jpg"/>
    <item>
      <title>Seeds &amp; sovereignty</title>
      <description><![CDATA[<p>About seeds.</p>]]></description>
      <guid isPermaLink="false">ep-2</guid>
      <pubDate>Tue, 03 Mar 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.org/2.mp3" length="1234" type="audio/mpeg"/>
      <itunes:duration>00:42:10</itunes:duration>
      <itunes:episode>2</itunes:episode>
    </item>
    <item>
      <title>Young farmers</title>
      <description>Plain text.</description>
      <guid>ep-1</guid>
      <pubDate>Mon, 02 Feb 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.org/1.mp3" length="99" type="audio/mpeg"/>
      <itunes:image href="https://example.org/ep1.jpg"/>
    </item>
    <item>
      <title>Open Pot stories</title>
      <guid>ep-3</guid>
      <pubDate>Wed, 01 Apr 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.org/3.mp3" length="5" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`

describe('podcast feed', () => {
  it('reads the show and its episodes, newest first', () => {
    const podcast = parsePodcastFeed(feed)
    expect(podcast).toMatchObject({
      title: 'Boerengroep Podcast',
      description: 'Stories from the field.',
      image: 'https://example.org/cover.jpg',
      author: 'Stichting Boerengroep',
      language: 'nl',
    })
    expect(podcast.episodes.map((e) => e.title)).toEqual(['Open Pot stories', 'Seeds & sovereignty', 'Young farmers'])
    expect(podcast.episodes[1]).toMatchObject({
      id: 'ep-2',
      description: 'About seeds.',
      audioUrl: 'https://example.org/2.mp3',
      audioType: 'audio/mpeg',
      duration: '00:42:10',
      pubDate: '2026-03-03T10:00:00.000Z',
      image: 'https://example.org/cover.jpg',
      episodeNumber: '2',
    })
    expect(podcast.episodes[2]?.image).toBe('https://example.org/ep1.jpg')
  })

  it('reads a feed with a single episode and one without any', () => {
    const one = feed.replace(/<item>[\s\S]*?<\/item>\s*<item>[\s\S]*?<\/item>/, '')
    expect(parsePodcastFeed(one).episodes).toHaveLength(1)
    expect(parsePodcastFeed(feed.replace(/<item>[\s\S]*<\/item>/, '')).episodes).toEqual([])
  })

  it('says so when the address does not hold a podcast', () => {
    expect(() => parsePodcastFeed('<html><body>Not found</body></html>')).toThrow(/not a podcast feed/)
  })
})

describe('episodes for a block', () => {
  const { episodes } = parsePodcastFeed(feed)

  it('takes the latest ones', () => {
    expect(pickEpisodes(episodes, { mode: 'latest', count: 2 }).map((e) => e.id)).toEqual(['ep-3', 'ep-2'])
  })

  it('finds chosen episodes by a few words of the title, in the editor’s order', () => {
    const picked = pickEpisodes(episodes, { mode: 'picked', matches: ['young FARMERS', 'seeds', 'no such episode', 'Young'] })
    expect(picked.map((e) => e.id)).toEqual(['ep-1', 'ep-2'])
  })

  it('shows nothing when nothing is chosen', () => {
    expect(pickEpisodes(episodes, { mode: 'picked', matches: [] })).toEqual([])
    expect(pickEpisodes(episodes, { mode: 'picked', matches: ['  '] })).toEqual([])
  })
})
