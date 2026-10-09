// Hand-made, for this app only. On the live site pictures and files come straight from the file
// storage, and nothing asks for this address. On a developer's machine there is no such
// storage: uploads sit in a folder, and the admin panel that would hand them out runs in the
// other app. This route hands them out here, so the site looks complete locally.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
    const folder = process.env.MEDIA_DIR;
    if (process.env.BLOB_READ_WRITE_TOKEN || !folder) return new Response('Not found', { status: 404 });
    const { path: parts } = await params;
    const root = path.resolve(folder);
    const file = path.resolve(root, parts.map((part) => decodeURIComponent(part)).join('/'));
    // Never outside the uploads folder.
    if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });
    try {
        const body = await readFile(file);
        return new Response(new Uint8Array(body), {
            headers: {
                'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return new Response('Not found', { status: 404 });
    }
}
