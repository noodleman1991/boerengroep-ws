import type { Media } from '@sites/cms/types';

/** What a download card shows about a file. */
export type FileInfo = { url: string; name: string; kind: string; size?: string; filename?: string };

const KINDS: [RegExp, string][] = [
  [/pdf$/, 'PDF'],
  [/wordprocessingml|msword/, 'Word'],
  [/spreadsheetml|ms-excel/, 'Excel'],
  [/presentationml|ms-powerpoint/, 'PowerPoint'],
  [/opendocument/, 'OpenDocument'],
  [/csv$/, 'CSV'],
  [/^text\/plain/, 'Text'],
  [/^image\/jpeg/, 'JPEG'],
  [/^image\/png/, 'PNG'],
  [/^image\/svg/, 'SVG'],
];

export function fileSize(bytes: number | null | undefined): string | undefined {
  if (!bytes || bytes <= 0) return undefined;
  if (bytes < 1000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} kB`;
  const mb = bytes / 1_000_000;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

function kindOf(mimeType: string | null | undefined, filename: string | null | undefined): string {
  const known = KINDS.find(([pattern]) => pattern.test(mimeType ?? ''))?.[1];
  if (known) return known;
  const extension = filename?.includes('.') ? filename.split('.').pop() : undefined;
  return extension ? extension.toUpperCase() : 'File';
}

/** The name without the extension, with underscores and hyphens as spaces. */
const tidy = (filename: string) => filename.replace(/\.[A-Za-z0-9]+$/, '').replace(/[_-]+/g, ' ').trim();

/** A file as shown to visitors. Null when the file is missing or was not loaded. */
export function fileInfo(file: number | string | Media | null | undefined, label?: string | null): FileInfo | null {
  if (!file || typeof file !== 'object' || !file.url) return null;
  return {
    url: file.url,
    name: label?.trim() || (file.filename ? tidy(file.filename) : 'File'),
    kind: kindOf(file.mimeType, file.filename),
    size: fileSize(file.filesize),
    filename: file.filename ?? undefined,
  };
}
