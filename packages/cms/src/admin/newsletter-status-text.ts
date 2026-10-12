/** The check on one confirmation email, for the languages of the site that use it. */
export type ConfirmationStatus = { languages: string[] } & (
  | { ok: true; id: number; name: string }
  /** No email is chosen. */
  | { ok: false; problem: 'none' }
  /** The chosen email does not exist, is switched off, or has no button to confirm with. */
  | { ok: false; problem: 'missing' | 'off' | 'no-button'; id: number; name?: string }
  | { ok: false; problem: 'unreadable'; id: number; error: string }
)

/** What a site's status endpoint reports about its sign-up box. Shared by the site and the admin panel. */
export type NewsletterStatusData = {
  /** True on a copy of the site that must not send email: there the box passes nobody to Brevo. */
  off: boolean
  key: { ok: true; account: string } | { ok: false; error: string }
  list:
    | { ok: true; id: number; name: string; people: number }
    | { ok: false; error: string; available?: { id: number; name: string; subscribers: number }[] }
  /** Empty when the key does not work. */
  confirmation: ConfirmationStatus[]
  /** The emails of the Brevo account, given when one still has to be chosen or repaired. */
  templates?: { id: number; name: string; active: boolean }[]
}

export type StatusLine = { tone: 'good' | 'attention' | 'problem' | 'plain'; text: string; detail?: string }

const people = (n: number) => (n === 1 ? '1 person' : `${n} people`)
const LANGUAGE: Record<string, string> = { en: 'English', nl: 'Dutch' }
const named = (codes: string[]) => codes.map((code) => LANGUAGE[code] ?? code).join(' and ')

type Wrong = Extract<ConfirmationStatus, { ok: false }>

/** What is wrong with the confirmation email, and what to do about it. */
function whatIsWrong(check: Wrong, who: string): StatusLine {
  if (check.problem === 'none') {
    return {
      tone: 'problem',
      text: `${who}No confirmation email is chosen yet, so nobody can sign up.`,
      detail: 'Fill in its number under "Brevo confirmation email" below and save.',
    }
  }
  if (check.problem === 'unreadable') {
    return { tone: 'problem', text: `${who}Email number ${check.id} could not be checked.`, detail: `Brevo says: "${check.error}".` }
  }
  if (check.problem === 'missing') {
    return { tone: 'problem', text: `${who}There is no email with number ${check.id} in this Brevo account, so nobody can sign up.` }
  }
  const email = check.name ? `The email "${check.name}" (number ${check.id})` : `Email number ${check.id}`
  return check.problem === 'off'
    ? {
        tone: 'problem',
        text: `${who}${email} is switched off in Brevo, so nobody receives it.`,
        detail: 'Open the email in Brevo and switch it on.',
      }
    : {
        tone: 'problem',
        text: `${who}${email} has no button to confirm with, so nobody can get on the list.`,
        detail: 'In Brevo, give the email a button and choose "Double opt-in link" as the kind of link.',
      }
}

/** The status as sentences an editor can act on. */
export function describeStatus(status: NewsletterStatusData): { lines: StatusLine[] } {
  const lines: StatusLine[] = []
  if (status.off) {
    lines.push({
      tone: 'attention',
      text: 'Emails are switched off on this copy of the website, so the sign-up box passes nobody to Brevo.',
      detail: 'That is how a trial copy is set up. The checks below still tell whether everything is ready for the real website.',
    })
  }

  if (!status.key.ok) {
    const where =
      'In Brevo, click your name at the top right, then "SMTP & API", then "API keys", and create a key. Paste it in the box "New Brevo key" below and press Save.'
    const noKey = /no brevo api key/i.test(status.key.error)
    lines.push(
      noKey
        ? { tone: 'problem', text: 'This site has no Brevo key yet, so nobody can sign up.', detail: where }
        : {
            tone: 'problem',
            text: 'Brevo does not accept the key of this site, so nobody can sign up.',
            detail: `Brevo says: "${status.key.error}". ${where}`,
          },
    )
    return { lines }
  }

  lines.push({ tone: 'good', text: `The link with Brevo works. Account: ${status.key.account}.` })

  if (status.list.ok) {
    lines.push({
      tone: 'good',
      text: `People who confirm their email go on the list "${status.list.name}" (number ${status.list.id}). It has ${people(status.list.people)}.`,
    })
  } else {
    const available = status.list.available
    lines.push({
      tone: 'problem',
      text: status.list.error,
      ...(available?.length
        ? {
            detail: `Lists in this Brevo account: ${available
              .map((l) => `number ${l.id} "${l.name}" (${people(l.subscribers)})`)
              .join(', ')}.`,
          }
        : {}),
    })
  }

  // Which languages a line is about is only worth saying when they differ.
  const apart = status.confirmation.length > 1
  const emails = status.templates?.length
    ? `Emails in this Brevo account: ${status.templates
        .map((t) => `number ${t.id} "${t.name}"${t.active ? '' : ' (switched off)'}`)
        .join(', ')}.`
    : undefined
  for (const check of status.confirmation) {
    const who = apart ? `${named(check.languages)}: ` : ''
    if (check.ok) {
      lines.push({ tone: 'good', text: `${who}Someone who signs up gets the email "${check.name}" (number ${check.id}) from Brevo.` })
      continue
    }
    const line = whatIsWrong(check, who)
    lines.push({ ...line, ...(emails ? { detail: [line.detail, emails].filter(Boolean).join(' ') } : {}) })
  }

  if (status.list.ok && status.confirmation.length > 0 && status.confirmation.every((check) => check.ok)) {
    lines.push({
      tone: status.off ? 'plain' : 'good',
      text: status.off
        ? 'Everything is ready. On the real website, someone who clicks the button in that email is on the list.'
        : 'The sign-up box works. Someone who clicks the button in that email is on the list.',
    })
  }
  return { lines }
}
