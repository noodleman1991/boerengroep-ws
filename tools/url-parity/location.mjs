/**
 * Next.js can send the Location header twice on the first, uncached response of a
 * redirect from a statically generated page. `fetch` joins repeated headers with ", ".
 * Browsers accept an identical duplicate, so the probe does too, and reports it.
 */
export function normalizeLocation(value) {
  if (value === null || value === undefined) return { location: undefined, duplicated: false }
  const parts = value.split(', ')
  if (parts.length > 1 && parts.every((part) => part === parts[0])) {
    return { location: parts[0], duplicated: true }
  }
  return { location: value, duplicated: false }
}
