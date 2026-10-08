import { describe, expect, it } from 'vitest'
import { parseVideo } from './video'

/** The video when it is one that is embedded, not a file. */
const embedded = (url: string) => {
  const video = parseVideo(url)
  return video && video.provider !== 'file' ? video : null
}

describe('video links', () => {
  it('understands the YouTube addresses people paste', () => {
    const expected = { provider: 'youtube', id: 'dQw4w9WgXcQ' }
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=abc',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      '  youtube.com/watch?v=dQw4w9WgXcQ  ',
    ]) {
      expect(parseVideo(url), url).toMatchObject(expected)
    }
  })

  it('plays YouTube from the address without cookies', () => {
    const video = embedded('https://youtu.be/dQw4w9WgXcQ')
    expect(video?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0')
    expect(video?.cover).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
  })

  it('keeps the moment a link points at', () => {
    expect(embedded('https://youtu.be/dQw4w9WgXcQ?t=90')?.embedUrl).toContain('start=90')
    expect(embedded('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s')?.embedUrl).toContain('start=90')
    expect(embedded('https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=12')?.embedUrl).toContain('start=12')
  })

  it('understands Vimeo, also unlisted videos, and asks Vimeo not to track', () => {
    expect(parseVideo('https://vimeo.com/123456789')).toMatchObject({
      provider: 'vimeo',
      id: '123456789',
      embedUrl: 'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1',
    })
    expect(embedded('https://vimeo.com/channels/staffpicks/123456789')?.id).toBe('123456789')
    expect(embedded('https://player.vimeo.com/video/123456789?h=abc123')?.embedUrl).toBe(
      'https://player.vimeo.com/video/123456789?autoplay=1&dnt=1&h=abc123',
    )
    expect(embedded('https://vimeo.com/123456789/abc123')?.embedUrl).toContain('h=abc123')
  })

  it('plays an uploaded or linked video file directly', () => {
    expect(parseVideo('https://blob.example/film.mp4')).toEqual({ provider: 'file', src: 'https://blob.example/film.mp4' })
    expect(parseVideo('/api/media/file/film.webm')).toEqual({ provider: 'file', src: '/api/media/file/film.webm' })
  })

  it('gives nothing for a link it cannot play, or for something that is not a link', () => {
    expect(parseVideo('https://example.org/some-page')).toBeNull()
    expect(parseVideo('https://www.youtube.com/@boerengroep')).toBeNull()
    expect(parseVideo('javascript:alert(1)')).toBeNull()
    expect(parseVideo('')).toBeNull()
    expect(parseVideo(null)).toBeNull()
  })
})
