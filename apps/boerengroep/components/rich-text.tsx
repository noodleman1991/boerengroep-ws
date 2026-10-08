import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { FileCard } from '@/components/media/file-card'
import { VideoEmbed } from '@/components/media/video-embed'
import { fileInfo } from '@/lib/files'

type UploadValue = {
  url?: string | null
  mimeType?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc?.value
      return doc && typeof doc === 'object' && 'path' in doc && typeof doc.path === 'string' ? doc.path : '/'
    },
  }),
  // A picture in a text gets its caption. Any other file becomes a download card.
  upload: ({ node }) => {
    const value = node.value as UploadValue | number | string | null
    if (!value || typeof value !== 'object' || !value.url) return null
    if (value.mimeType?.startsWith('image/')) {
      const caption = value.caption?.trim()
      return (
        <figure className="rich-figure">
          {value.width && value.height ? (
            <Image src={value.url} alt={value.alt ?? ''} width={value.width} height={value.height} sizes="(max-width: 800px) 100vw, 800px" />
          ) : (
            // Without known dimensions the optimised image component cannot reserve space, so a plain image it is.
            <img src={value.url} alt={value.alt ?? ''} loading="lazy" />
          )}
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      )
    }
    const file = fileInfo(value as never)
    return file ? (
      <div className="rich-file">
        <FileCard file={file} downloadLabel="Download" />
      </div>
    ) : null
  },
  blocks: {
    videoEmbed: ({ node }: { node: { fields: { url?: string | null; caption?: string | null } } }) => (
      <div className="rich-video">
        <VideoEmbed url={node.fields.url} caption={node.fields.caption} />
      </div>
    ),
  },
})

export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return <LexicalRichText data={data as SerializedEditorState} converters={converters} className={className} />
}
