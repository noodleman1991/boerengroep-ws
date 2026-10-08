import type { Id, Lexical } from './context'

type Node = { type?: string; tag?: string; text?: unknown; value?: unknown; children?: Node[] }
export type GalleryDraft = { title?: string; intro?: string; images: { id: Id; caption?: string }[] }

const plain = (node: Node): string => (typeof node.text === 'string' ? node.text : (node.children ?? []).map(plain).join(''))
const tidy = (text: string) => text.replace(/\s+/g, ' ').trim()

/**
 * Reads a text that is really a photo page: a heading, then pictures with a sentence under
 * each. A heading starts a gallery and names it. A sentence right after a picture is that
 * picture's caption, without a closing colon. A sentence before the first picture introduces
 * the gallery.
 *
 * Returns nothing for a text with fewer than two pictures, which is a text with a picture in
 * it, and for a text with parts a gallery cannot hold, such as a list. Those stay as they are.
 */
export function readAsGalleries(body: Lexical | undefined): GalleryDraft[] | undefined {
  const nodes = ((body as { root?: Node } | undefined)?.root?.children ?? []) as Node[]
  const galleries: GalleryDraft[] = []
  let current: GalleryDraft = { images: [] }
  const close = () => {
    if (current.images.length > 0) galleries.push(current)
  }

  for (const node of nodes) {
    if (node.type === 'heading') {
      close()
      current = { title: tidy(plain(node)) || undefined, images: [] }
    } else if (node.type === 'upload') {
      const value = node.value as Id | { id?: Id } | undefined
      const id = typeof value === 'object' && value !== null ? value.id : value
      if (id === undefined) return undefined
      current.images.push({ id })
    } else if (node.type === 'paragraph') {
      const words = tidy(plain(node))
      if (!words) continue
      const last = current.images.at(-1)
      if (!last) current.intro = current.intro ? `${current.intro} ${words}` : words
      else last.caption = last.caption ? `${last.caption} ${words}` : words.replace(/\s*:$/, '')
    } else {
      return undefined
    }
  }
  close()
  return galleries.reduce((sum, gallery) => sum + gallery.images.length, 0) >= 2 ? galleries : undefined
}
