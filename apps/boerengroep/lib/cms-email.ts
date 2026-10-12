type Env = Record<string, string | undefined>

/**
 * True on a copy of the site that must not send mail. `EMAILS_OFF=1` is for a copy on a
 * laptop, a trial copy and test runs: such a copy knows the real addresses of the
 * organisation, and whatever is typed in its newsletter box must not reach a real inbox.
 */
export const emailsOff = (env: Env): boolean => env.EMAILS_OFF === '1'

/** The key of the mail service, or nothing when this copy of the site must not send mail. */
export function mailKey(env: Env): string | undefined {
  if (emailsOff(env)) return undefined
  return (env.RESEND_API_KEY || env.RESEND_BOERENGROEP)?.trim() || undefined
}

/**
 * Sender settings for emails the CMS sends, such as password resets and copies of form
 * answers. Without them the CMS only writes emails to its log. (The newsletter is not sent
 * from here: Brevo sends it, and its confirmation email too.)
 */
export function emailFromEnv(env: Env, siteName: string): { apiKey: string; fromAddress: string; fromName: string } | undefined {
  const apiKey = mailKey(env)
  const fromAddress = env.FROM_EMAIL?.trim()
  if (!apiKey || !fromAddress) return undefined
  return { apiKey, fromAddress, fromName: env.FROM_NAME?.trim() || siteName }
}
