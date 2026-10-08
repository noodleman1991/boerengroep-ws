'use client';
import type { DocumentsBlock as DocumentsData } from '@sites/cms/types';
import { useTranslations } from 'next-intl';
import { FileCard } from '@/components/media/file-card';
import { fileInfo } from '@/lib/files';
import { Section } from '../layout/section';

/** Files to download, as a tidy list of cards. */
export const DocumentsBlock = ({ data }: { data: DocumentsData }) => {
    const t = useTranslations('media');
    const files = (data.files ?? []).flatMap((row) => fileInfo(row.file, row.label) ?? []);
    if (files.length === 0) return null;
    return (
        <Section background={data.background}>
            <div className="block-head">
                <h2>{data.title || t('downloads')}</h2>
            </div>
            <ul className="file-list">
                {files.map((file) => (
                    <li key={file.url}>
                        <FileCard file={file} downloadLabel={t('download')} />
                    </li>
                ))}
            </ul>
        </Section>
    );
};
