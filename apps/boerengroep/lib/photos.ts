import type { Media } from '@sites/cms/types';

/** A picture as galleries show it. */
export type Photo = {
  id: number | string;
  /** The whole picture, for the large view. */
  full: string;
  /** 4:3 cut for tiles. */
  tile: string;
  /** Square cut. */
  square: string;
  width?: number;
  height?: number;
  alt: string;
  caption?: string;
};

type Ref = number | string | Media | null | undefined;

/** Pictures out of a list of uploads. Other files, and uploads that were not loaded, are left out. */
export function toPhotos(list: Ref[] | null | undefined): Photo[] {
  const photos: Photo[] = [];
  for (const item of list ?? []) {
    if (!item || typeof item !== 'object' || !item.url) continue;
    if (!item.mimeType?.startsWith('image/')) continue;
    const sizes = (item.sizes ?? {}) as Record<string, { url?: string | null } | undefined>;
    const caption = item.caption?.trim() || undefined;
    photos.push({
      id: item.id,
      full: item.url,
      tile: sizes.card?.url ?? item.url,
      square: sizes.square?.url ?? item.url,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      alt: item.alt?.trim() || caption || '',
      caption,
    });
  }
  return photos;
}
