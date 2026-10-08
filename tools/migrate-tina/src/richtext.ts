import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import type { Ctx, Lexical } from './context'
import type { Report } from './report'

export function scanMarkdown(markdown: string): { components: string[]; images: string[] } {
  const components = [...markdown.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)].map((m) => m[1]!)
  const images = [...markdown.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/g)].map((m) => m[1]!)
  return { components: [...new Set(components)], images }
}

export type InlineImage = { token: string; alt: string; src: string }

// The address may sit in angle brackets, or escape its own brackets: `/uploads/photo \(1\).png`.
const IMAGE = /!\[([^\]]*)\]\(\s*(<[^>]+>|(?:\\.|[^)\s\\])+)(?:\s+"[^"]*")?\s*\)/g
const ESCAPED = /\\([!-/:-@[-`{-~])/g
const TOKEN = /TINAIMAGE\d+TOKEN/g

/**
 * Takes inline markdown images out of the text and leaves a token in their place, on a
 * paragraph of its own. The markdown converter has no image support, so the images are
 * put back afterwards as upload nodes.
 */
export function extractInlineImages(markdown: string): { markdown: string; images: InlineImage[] } {
  const images: InlineImage[] = []
  const out = markdown.replace(IMAGE, (_match, alt: string, rawSrc: string) => {
    const token = `TINAIMAGE${images.length}TOKEN`
    let src = rawSrc.startsWith('<') ? rawSrc.slice(1, -1) : rawSrc.replace(ESCAPED, '$1')
    try {
      src = decodeURI(src)
    } catch {
      // keep the raw address when it is not valid percent-encoding
    }
    images.push({ token, alt, src })
    return `\n\n${token}\n\n`
  })
  return { markdown: out, images }
}

type Node = { type?: string; text?: string; children?: Node[]; [key: string]: unknown }

function uploadNode(mediaId: number | string): Node {
  return {
    type: 'upload',
    version: 3,
    format: '',
    id: crypto.randomUUID().replace(/-/g, '').slice(0, 24),
    fields: null,
    relationTo: 'media',
    value: mediaId,
  }
}

/** Replaces image tokens in a converted editor state with upload nodes. */
export function placeUploads(state: unknown, mediaByToken: Record<string, number | string | undefined>): unknown {
  const root = (state as { root?: Node }).root
  if (!root?.children) return state
  const next: Node[] = []
  for (const node of root.children) {
    const texts = (node.children ?? []).filter((child) => child.type === 'text' && typeof child.text === 'string')
    const tokens = texts.flatMap((child) => child.text!.match(TOKEN) ?? [])
    if (node.type !== 'paragraph' || tokens.length === 0) {
      next.push(node)
      continue
    }
    for (const child of texts) child.text = child.text!.replace(TOKEN, '')
    const remaining = (node.children ?? []).map((child) => child.text ?? 'x').join('').trim()
    if (remaining !== '') next.push(node)
    for (const token of tokens) {
      const mediaId = mediaByToken[token]
      if (mediaId !== undefined) next.push(uploadNode(mediaId))
    }
  }
  root.children = next
  return state
}

/** Files that Tina kept on its own file server. The path after the project number is the path in the uploads folder. */
const TINA_FILE = /^https?:\/\/assets\.tina\.io\/[^/]+(\/.+)$/i

/** The uploads path of a file of the old site that an address leads to, or nothing for any other address. */
export function uploadedFileKey(url: string): string | undefined {
  const hosted = url.match(TINA_FILE)
  const raw = hosted ? `/uploads${hosted[1]}` : url.startsWith('/uploads/') ? url : undefined
  if (!raw) return undefined
  const file = raw.split(/[?#]/)[0]!
  try {
    return decodeURI(file)
  } catch {
    return file
  }
}

/**
 * Points links to files of the old site at the imported file. A link to Tina's file server
 * works only as long as the old site's account exists, and a link to the imported file follows
 * the file wherever it is stored. `onMissing` hears about links to that server with no file here.
 */
export function linkUploads(state: unknown, media: Map<string, number | string>, onMissing: (url: string) => void = () => {}): unknown {
  const visit = (node: Node) => {
    const fields = node.fields as { url?: string } | null | undefined
    if ((node.type === 'link' || node.type === 'autolink') && typeof fields?.url === 'string') {
      const key = uploadedFileKey(fields.url)
      const id = key === undefined ? undefined : media.get(key)
      if (id !== undefined) {
        const { url: _url, ...rest } = fields
        node.type = 'link'
        node.fields = { ...rest, linkType: 'internal', doc: { relationTo: 'media', value: id } }
      } else if (TINA_FILE.test(fields.url)) {
        onMissing(fields.url)
      }
    }
    for (const child of node.children ?? []) visit(child)
  }
  const root = (state as { root?: Node }).root
  if (root) visit(root)
  return state
}

export async function makeToLexical(
  payload: Payload,
  report: Report,
  media: Map<string, number | string> = new Map(),
): Promise<Ctx['toLexical']> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  return async (markdown, legacyId) => {
    if (markdown === undefined || markdown === null) return undefined
    if (typeof markdown !== 'string') {
      report.add('error', legacyId, 'rich text value is not a markdown string')
      return undefined
    }
    if (markdown.trim() === '') return undefined

    const found = scanMarkdown(markdown)
    for (const name of found.components) {
      report.add('unknown-mdx', legacyId, `<${name}> was imported as plain text and needs manual repair`)
    }

    // Inline images become upload nodes that point at the migrated media file.
    const extracted = extractInlineImages(markdown)
    const mediaByToken: Record<string, number | string | undefined> = {}
    for (const image of extracted.images) {
      const id = media.get(image.src)
      mediaByToken[image.token] = id
      if (id === undefined) {
        report.add('missing-media', legacyId, `inline image ${image.src} is not in the uploads folder and was left out`)
      }
    }

    const state = convertMarkdownToLexical({ editorConfig, markdown: extracted.markdown })
    linkUploads(state, media, (url) =>
      report.add('missing-media', legacyId, `the link to ${url} leads to the old site's file server, and the file is not in the uploads folder. It stops working when that account is closed`),
    )
    return placeUploads(state, mediaByToken) as Lexical
  }
}
