import type { Photo } from './photos';
import { parseVideo, type Video } from './video';

/** A video in a gallery. */
export type VideoItem = {
  kind: 'video';
  id: string;
  video: Video;
  url: string;
  caption?: string;
  /** A picture to show before it plays, when the video site offers one. */
  cover?: string;
};

export type GalleryItem = ({ kind: 'photo' } & Photo) | VideoItem;

/** The videos an editor listed. A link that cannot be played is left out. */
export function toVideoItems(rows: ({ url?: string | null; caption?: string | null } | null | undefined)[] | null | undefined): VideoItem[] {
  const items: VideoItem[] = [];
  (rows ?? []).forEach((row, index) => {
    const video = parseVideo(row?.url);
    if (!video || !row?.url) return;
    items.push({
      kind: 'video',
      id: `video-${index}`,
      video,
      url: row.url,
      caption: row.caption?.trim() || undefined,
      cover: video.provider !== 'file' ? video.cover : undefined,
    });
  });
  return items;
}

// On a wide screen the first, fourth and seventh tile of every seven are the large ones.
const LARGE = new Set([0, 3, 6]);

/**
 * Photos and videos in the order of the mosaic. Videos take the large places, since a
 * moving picture deserves the room. Both keep the order the editor gave them.
 */
export function arrangeGallery(photos: Photo[], videos: VideoItem[]): GalleryItem[] {
  const out: GalleryItem[] = [];
  let p = 0;
  let v = 0;
  for (let slot = 0; slot < photos.length + videos.length; slot++) {
    const wantsVideo = LARGE.has(slot % 7) && v < videos.length;
    if (wantsVideo || p >= photos.length) out.push(videos[v++]!);
    else out.push({ kind: 'photo', ...photos[p++]! });
  }
  return out;
}
