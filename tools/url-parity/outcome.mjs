const isRedirect = (status) => status >= 300 && status < 400

/** Classifies the chain of responses that a URL produced. */
export function outcome(chain) {
  const last = chain[chain.length - 1]
  if (!last) return 'broken'
  if (isRedirect(last.status)) return 'loop'
  if (last.status !== 200) return 'broken'
  return chain.length === 1 ? 'ok' : 'redirect-ok'
}
