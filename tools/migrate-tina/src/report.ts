export type ReportKind =
  | 'error'
  | 'unpaired-locale'
  | 'unresolved-reference'
  | 'unknown-mdx'
  | 'inline-image'
  | 'missing-media'
  | 'shadowed-file'
  | 'placeholder-parent'
  | 'slug-changed'
  | 'skipped'

export type ReportEntry = { kind: ReportKind; legacyId: string; message: string }

const ORDER: ReportKind[] = [
  'error',
  'unresolved-reference',
  'missing-media',
  'unknown-mdx',
  'inline-image',
  'slug-changed',
  'unpaired-locale',
  'placeholder-parent',
  'shadowed-file',
  'skipped',
]

export class Report {
  entries: ReportEntry[] = []

  add(kind: ReportKind, legacyId: string, message: string): void {
    this.entries.push({ kind, legacyId, message })
  }

  count(kind?: ReportKind): number {
    return kind ? this.entries.filter((e) => e.kind === kind).length : this.entries.length
  }

  get failed(): boolean {
    return this.count('error') > 0
  }

  toMarkdown(): string {
    const lines = ['# Migration report', '']
    if (this.entries.length === 0) lines.push('Nothing to report.', '')
    for (const kind of ORDER) {
      const items = this.entries.filter((e) => e.kind === kind)
      if (items.length === 0) continue
      lines.push(`## ${kind} (${items.length})`, '')
      for (const e of items) lines.push(`- \`${e.legacyId}\`: ${e.message}`)
      lines.push('')
    }
    return lines.join('\n')
  }
}
