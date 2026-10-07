import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import type { Ctx, Lexical } from './context'
import type { Report } from './report'

export function scanMarkdown(markdown: string): { components: string[]; images: string[] } {
  const components = [...markdown.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)].map((m) => m[1]!)
  const images = [...markdown.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/g)].map((m) => m[1]!)
  return { components: [...new Set(components)], images }
}

export async function makeToLexical(payload: Payload, report: Report): Promise<Ctx['toLexical']> {
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
    for (const src of found.images) {
      report.add('inline-image', legacyId, `inline image ${src} must be re-inserted by hand`)
    }

    return convertMarkdownToLexical({ editorConfig, markdown }) as unknown as Lexical
  }
}
