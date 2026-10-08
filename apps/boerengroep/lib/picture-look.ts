/** How an editor wants a picture or a gallery shown. Anything unknown falls back to the usual look. */

const SIZES = ['small', 'medium', 'large', 'full'] as const;
const PLACES = ['left', 'centre', 'right'] as const;
type PictureSize = (typeof SIZES)[number];
type PicturePlace = (typeof PLACES)[number];

// How much room a picture gets on a wide screen, for the browser to pick a fitting file.
const WIDTHS: Record<PictureSize, string> = { small: '280px', medium: '420px', large: '620px', full: '800px' };

/**
 * The look of a picture inside a text. Text only runs beside a small or medium picture: beside
 * a larger one there is no room left to read.
 */
export function pictureLook(fields: unknown): { className: string; sizes: string; caption?: string } {
  const given = (fields && typeof fields === 'object' ? fields : {}) as { size?: unknown; place?: unknown; caption?: unknown };
  const size: PictureSize = SIZES.includes(given.size as PictureSize) ? (given.size as PictureSize) : 'full';
  const wanted: PicturePlace = PLACES.includes(given.place as PicturePlace) ? (given.place as PicturePlace) : 'centre';
  const place: PicturePlace = size === 'small' || size === 'medium' ? wanted : 'centre';
  const caption = typeof given.caption === 'string' && given.caption.trim() ? given.caption.trim() : undefined;
  return {
    className: `rich-figure rich-figure--${size} rich-figure--${place}`,
    sizes: `(max-width: 640px) 100vw, ${WIDTHS[size]}`,
    caption,
  };
}

export const GALLERY_SIZES = ['mosaic', 'small', 'medium', 'large'] as const;
export type GallerySize = (typeof GALLERY_SIZES)[number];

/** The size of the photos in a gallery. */
export function gallerySize(value: unknown, fallback: GallerySize = 'mosaic'): GallerySize {
  return GALLERY_SIZES.includes(value as GallerySize) ? (value as GallerySize) : fallback;
}
