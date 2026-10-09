import { Download } from 'lucide-react';
import type { FileInfo } from '@/lib/files';

/** A file to download: its name, what kind of file it is and how large. */
export function FileCard({ file, downloadLabel }: { file: FileInfo; downloadLabel: string }) {
    return (
        <a className="file-card" href={file.url} download={file.filename ?? true}>
            <span className="file-card__kind" aria-hidden="true">
                {file.kind}
            </span>
            <span className="file-card__body">
                <span className="file-card__name">{file.name}</span>
                <span className="file-card__meta">{[file.kind, file.size].filter(Boolean).join(', ')}</span>
            </span>
            <Download aria-hidden="true" />
            <span className="sr-only">{downloadLabel}</span>
        </a>
    );
}
