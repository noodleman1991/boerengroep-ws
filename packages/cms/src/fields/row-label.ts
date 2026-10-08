type RowLabel = { RowLabel: { path: string; clientProps: { field: string; fallback: string } } }

/**
 * Shows what an editor typed in a row as the title of that row.
 * `field` is the text field inside the row to read. `fallback` is used while it is empty.
 * Use the result as `admin` of a list field, or its `components` inside an existing `admin`.
 */
export function rowLabel(field: string, fallback: string): { components: RowLabel } {
  return { components: { RowLabel: { path: '@/components/admin/row-title#RowTitle', clientProps: { field, fallback } } } }
}
