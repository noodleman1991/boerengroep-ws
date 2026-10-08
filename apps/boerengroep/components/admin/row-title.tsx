'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * The title of a row in a list, taken from what the editor typed in it. "Calendar" says more
 * than "Menu item 03" when someone looks for the row to change.
 */
export function RowTitle({ field = 'label', fallback = 'Item' }: { field?: string; fallback?: string }) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = data?.[field]
  const typed = typeof value === 'string' ? value.trim() : ''
  return <span>{typed || `${fallback} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
}
