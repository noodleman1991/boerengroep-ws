type Env = Record<string, string | undefined>

/**
 * Sender settings for emails the CMS sends, such as password resets. Reuses the
 * Resend account the newsletter already uses. Without them the CMS only logs emails.
 */
export function emailFromEnv(env: Env): { apiKey: string; fromAddress: string; fromName: string } | undefined {
  const apiKey = env.RESEND_BOERENGROEP?.trim()
  const fromAddress = env.FROM_EMAIL?.trim()
  if (!apiKey || !fromAddress) return undefined
  return { apiKey, fromAddress, fromName: env.FROM_NAME?.trim() || 'Stichting Boerengroep' }
}
