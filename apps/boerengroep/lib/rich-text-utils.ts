type Node = { type?: string; text?: unknown; children?: unknown }

/** Node types that are content by themselves, without any text inside. */
const STANDALONE = new Set(['upload', 'block', 'inlineBlock', 'horizontalrule', 'relationship'])

function nodeHasContent(node: Node): boolean {
  if (node.type === 'text') return typeof node.text === 'string' && node.text.trim().length > 0
  if (node.type && STANDALONE.has(node.type)) return true
  return Array.isArray(node.children) && node.children.some((child) => nodeHasContent(child as Node))
}

/** True when a Lexical editor state holds visible content. */
export function hasRichText(data: unknown): boolean {
  if (!data || typeof data !== 'object' || !('root' in data)) return false
  const root = (data as { root?: Node }).root
  return Boolean(root && Array.isArray(root.children) && root.children.some((child) => nodeHasContent(child as Node)))
}
