/** What a site's status endpoint reports about its link with Brevo. Shared by the site and the admin panel. */
export type NewsletterStatusData = {
  key: { ok: true; account: string } | { ok: false; error: string }
  list:
    | { ok: true; id: number; name: string; people: number }
    | { ok: false; error: string; available?: { id: number; name: string; subscribers: number }[] }
  site: { confirmed: number; waiting: number; left: number }
  /** Confirmed on the site but not on the Brevo list. Null when the list could not be read. */
  missing: number | null
  /** Unsubscribed on the site but still on the Brevo list. */
  stale: number | null
}

export type StatusLine = { tone: 'good' | 'attention' | 'problem' | 'plain'; text: string; detail?: string }

const people = (n: number) => (n === 1 ? '1 person' : `${n} people`)

/** The status as sentences an editor can act on. */
export function describeStatus(status: NewsletterStatusData): { lines: StatusLine[]; canSync: boolean } {
  const { site } = status
  const onSite: StatusLine = {
    tone: 'plain',
    text: `On this site: ${people(site.confirmed)} confirmed, ${site.waiting} still have to click the link in their email, ${site.left} unsubscribed.`,
  }

  if (!status.key.ok) {
    const where =
      'In Brevo, click your name at the top right, then "SMTP & API", then "API keys", and create a key. Paste it in the box "New Brevo key" below and press Save.'
    const noKey = /no brevo api key/i.test(status.key.error)
    return {
      lines: [
        noKey
          ? { tone: 'problem', text: 'This site has no Brevo key yet, so nobody is added to your list.', detail: where }
          : {
              tone: 'problem',
              text: 'Brevo does not accept the key of this site, so nobody is added to your list.',
              detail: `Brevo says: "${status.key.error}". ${where}`,
            },
        onSite,
      ],
      canSync: false,
    }
  }

  const lines: StatusLine[] = [
    { tone: 'good', text: `The link with Brevo works. Account: ${status.key.account}.` },
  ]

  if (!status.list.ok) {
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
    lines.push(onSite)
    return { lines, canSync: false }
  }

  lines.push({
    tone: 'good',
    text: `People who confirm their email go to the list "${status.list.name}" (number ${status.list.id}). It has ${people(status.list.people)}.`,
  })
  lines.push(onSite)

  const missing = status.missing ?? 0
  const stale = status.stale ?? 0
  if (missing > 0) {
    lines.push({
      tone: 'attention',
      text: `${people(missing)} confirmed on the site but ${missing === 1 ? 'is' : 'are'} not on the Brevo list.`,
    })
  }
  if (stale > 0) {
    lines.push({
      tone: 'attention',
      text: `${people(stale)} unsubscribed on the site but ${stale === 1 ? 'is' : 'are'} still on the Brevo list.`,
    })
  }
  if (missing === 0 && stale === 0) {
    lines.push({ tone: 'good', text: 'The list is complete. There is nothing to do.' })
  }
  return { lines, canSync: missing > 0 || stale > 0 }
}
