/**
 * Turns a link an editor pasted into something the site can play.
 * YouTube and Vimeo are embedded in their privacy modes and only after a visitor presses play.
 */

export type Video =
  | { provider: 'youtube' | 'vimeo'; id: string; embedUrl: string; cover?: string }
  | { provider: 'file'; src: string };

const FILE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** "90", "90s" or "1m30s" as seconds. */
function seconds(value: string | null): number | undefined {
  if (!value) return undefined;
  if (/^\d+s?$/.test(value)) return Number.parseInt(value, 10);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return undefined;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

export function parseVideo(input: string | null | undefined): Video | null {
  const raw = input?.trim();
  if (!raw) return null;
  if (raw.startsWith('/') && FILE.test(raw)) return { provider: 'file', src: raw };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
    const id =
      host === 'youtu.be'
        ? parts[0]
        : parts[0] === 'watch'
          ? url.searchParams.get('v')
          : ['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')
            ? parts[1]
            : undefined;
    if (!id || !YOUTUBE_ID.test(id)) return null;
    const start = seconds(url.searchParams.get('t')) ?? seconds(url.searchParams.get('start'));
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? `&start=${start}` : ''}`,
      cover: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const index = parts.findIndex((part) => /^\d+$/.test(part));
    const id = parts[index];
    if (index < 0 || !id) return null;
    // Unlisted videos carry a key, in the address or as ?h=.
    const key = url.searchParams.get('h') ?? (/^[0-9a-f]+$/i.test(parts[index + 1] ?? '') ? parts[index + 1] : null);
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${key ? `&h=${key}` : ''}`,
    };
  }

  if (FILE.test(url.pathname)) return { provider: 'file', src: url.toString() };
  return null;
}
