import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc?.value
      return doc && typeof doc === 'object' && 'path' in doc && typeof doc.path === 'string' ? doc.path : '/'
    },
  }),
})

export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return <LexicalRichText data={data as SerializedEditorState} converters={converters} className={className} />
}
