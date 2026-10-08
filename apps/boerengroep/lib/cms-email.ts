type Env = Record<string, string | undefined>

/**
 * The key of the mail service, or nothing when this copy of the site must not send mail.
 * `EMAILS_OFF=1` is for a copy on a laptop and for test runs: such a copy holds the real
 * addresses of the organisation and of subscribers, and a test must never write to them.
 */
export function mailKey(env: Env): string | undefined {
  if (env.EMAILS_OFF === '1') return undefined
  return (env.RESEND_API_KEY || env.RESEND_BOERENGROEP)?.trim() || undefined
}

/**
 * Sender settings for emails the CMS sends, such as password resets and copies of form
 * answers. Reuses the Resend account the newsletter already uses. Without them the CMS only
 * writes emails to its log.
 */
export function emailFromEnv(env: Env, siteName: string): { apiKey: string; fromAddress: string; fromName: string } | undefined {
  const apiKey = mailKey(env)
  const fromAddress = env.FROM_EMAIL?.trim()
  if (!apiKey || !fromAddress) return undefined
  return { apiKey, fromAddress, fromName: env.FROM_NAME?.trim() || siteName }
}
