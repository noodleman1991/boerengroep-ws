const PATTERNS = [
  ['DROP COLUMN', /\bDROP\s+COLUMN\b/i],
  ['DROP TABLE', /\bDROP\s+TABLE\b/i],
  ['RENAME COLUMN', /\bRENAME\s+COLUMN\b/i],
  ['RENAME TO', /\bRENAME\s+TO\b/i],
]

/**
 * Returns the destructive statement kinds found in a migration's `up` function.
 * A file is exempt when it carries a `// contract-ok: <reason>` comment with a reason.
 */
export function findDestructive(source) {
  // The reason must be on the same line as the marker.
  if (/\/\/[ \t]*contract-ok:[ \t]*\S+/.test(source)) return []
  const up = source.split(/export\s+async\s+function\s+down\b/)[0]
  return PATTERNS.filter(([, re]) => re.test(up)).map(([name]) => name)
}
