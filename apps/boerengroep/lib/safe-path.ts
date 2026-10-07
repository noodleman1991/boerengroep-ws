/** True for a same-site path. Guards redirect targets taken from a query string. */
export function isSafeInternalPath(value: string | null): value is string {
  if (!value || !value.startsWith('/')) return false
  if (value.startsWith('//') || value.includes('\\')) return false
  return true
}
