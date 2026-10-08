import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { FileCard } from '@/components/media/file-card'
import { Gallery } from '@/components/media/gallery'
import { VideoEmbed } from '@/components/media/video-embed'
import { fileInfo } from '@/lib/files'
import { outlineHeadings } from '@/lib/heading-outline'
import { toPhotos } from '@/lib/photos'
import { gallerySize, pictureLook } from '@/lib/picture-look'

type UploadValue = {
  url?: string | null
  mimeType?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

/** Where a link to something on the site leads. Exported for the tests. */
export function linkedAddress(doc: { relationTo?: string; value?: unknown } | null | undefined): string {
  const value = doc?.value
  if (!value || typeof value !== 'object') return '/'
  if (doc?.relationTo === 'media') return 'url' in value && typeof value.url === 'string' ? value.url : '/'
  return 'path' in value && typeof value.path === 'string' ? value.path : '/'
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    // A link to a page leads to its address, a link to a file to the file itself.
    internalDocToHref: ({ linkNode }) => linkedAddress(linkNode.fields.doc),
  }),
  // A heading has the level the page needs and the look the editor picked. See lib/heading-outline.
  heading: ({ node, nodesToJSX }) => {
    const { tag, look, children } = node as unknown as { tag: string; look?: string; children: never[] }
    const Tag = (/^h[1-6]$/.test(tag) ? tag : 'h2') as 'h2'
    return <Tag data-look={look && look !== tag ? look : undefined}>{nodesToJSX({ nodes: children })}</Tag>
  },
  // A picture in a text gets its caption. Any other file becomes a download card.
  upload: ({ node }) => {
    const value = node.value as UploadValue | number | string | null
    if (!value || typeof value !== 'object' || !value.url) return null
    if (value.mimeType?.startsWith('image/')) {
      // The editor chose a size and a place for this picture, and may have written a line for it here.
      const look = pictureLook((node as { fields?: unknown }).fields)
      const caption = look.caption ?? value.caption?.trim()
      return (
        <figure className={look.className}>
          {value.width && value.height ? (
            <Image src={value.url} alt={value.alt ?? ''} width={value.width} height={value.height} sizes={look.sizes} />
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
    // Several photos between two paragraphs. A click opens them large.
    photoGallery: ({ node }: { node: { fields: { images?: unknown; size?: string | null; caption?: string | null } } }) => {
      const photos = toPhotos(node.fields.images as never)
      if (photos.length === 0) return null
      const caption = node.fields.caption?.trim()
      return (
        <figure className="rich-gallery">
          <Gallery photos={photos} size={gallerySize(node.fields.size, 'medium')} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      )
    },
  },
})

export function RichText({ data, className, headingsFrom = 2 }: {
  data?: unknown
  className?: string
  /** The level of the first heading in this text: one below the heading that stands above it. */
  headingsFrom?: 2 | 3 | 4 | 5 | 6
}) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  // `rich-flow` keeps a picture that has text beside it inside its own text.
  return <LexicalRichText data={outlineHeadings(data, headingsFrom) as SerializedEditorState} converters={converters} className={className ? `rich-flow ${className}` : 'rich-flow'} />
}
