const MAX_TITLE = 60

const dutchDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Amsterdam',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * The last part of an event's web address: its title and its date.
 * Many events repeat under the same name, so the date keeps each address its own.
 */
export function eventSlug(title: string | null | undefined, start: string | Date | null | undefined): string {
  let words = (title ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (words.length > MAX_TITLE) {
    words = words.slice(0, MAX_TITLE + 1)
    words = words.slice(0, words.lastIndexOf('-'))
  }
  if (!words) words = 'event'

  const date = start ? new Date(start) : undefined
  if (!date || Number.isNaN(date.getTime())) return words
  return `${words}-${dutchDate.format(date)}`
}
