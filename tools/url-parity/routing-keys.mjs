/** Reads the static keys of the `pathnames` object in an i18n/routing.ts source. */
export function parseRoutingKeys(source) {
  const start = source.indexOf('pathnames:')
  if (start === -1) return []
  const keys = []
  for (const match of source.slice(start).matchAll(/^\s*'(\/[^']*)'\s*:/gm)) {
    if (!match[1].includes('[')) keys.push(match[1])
  }
  return keys
}
