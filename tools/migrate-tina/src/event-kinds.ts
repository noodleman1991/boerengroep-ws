import { type Ctx, type Id, upsert } from './context'

/** The kinds the old site had built in. The names are a fallback for the old translation files. */
const OLD_KINDS: Record<string, { en: string; nl: string; colour: string }> = {
  talk: { en: 'Talk', nl: 'Lezing', colour: 'green' },
  lecture: { en: 'Lecture', nl: 'College', colour: 'teal' },
  workshop: { en: 'Workshop', nl: 'Workshop', colour: 'orange' },
  excursion: { en: 'Excursion', nl: 'Excursie', colour: 'blue' },
  'soup-kitchen': { en: 'Open Pot', nl: 'Open Pot', colour: 'red' },
  csa: { en: 'CSA', nl: 'CSA', colour: 'brown' },
  meeting: { en: 'Meeting', nl: 'Vergadering', colour: 'purple' },
  'board-meeting': { en: 'Board meeting', nl: 'Bestuursvergadering', colour: 'grey' },
}

/** The name the old site showed for a kind, from its translation file. */
function oldName(messages: unknown, kind: string): string | undefined {
  const name = (messages as { calendar?: { eventTypes?: Record<string, unknown> } } | undefined)?.calendar?.eventTypes?.[kind]
  return typeof name === 'string' && name.trim() ? name.trim() : undefined
}

const readable = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1).replace(/-/g, ' ')

/**
 * The old site knew a fixed list of kinds of events. The new one lets editors make their own.
 * This makes a kind for each one the imported events use, named as the old site named it,
 * and returns its id. Kinds nobody uses are not made.
 */
export function kindMaker(ctx: Ctx): (kind: unknown) => Promise<Id | undefined> {
  const made = new Map<string, Id>()
  return async (value) => {
    const kind = typeof value === 'string' ? value.trim() : ''
    if (!kind) return undefined
    const known = made.get(kind)
    if (known !== undefined) return known
    const old = OLD_KINDS[kind]
    const legacyId = `event-kinds/${kind}`
    const id = await upsert(ctx, 'event-kinds', legacyId, { name: oldName(ctx.messages.en, kind) ?? old?.en ?? readable(kind), colour: old?.colour ?? 'grey' }, 'en')
    await upsert(ctx, 'event-kinds', legacyId, { name: oldName(ctx.messages.nl, kind) ?? old?.nl ?? readable(kind) }, 'nl')
    made.set(kind, id)
    return id
  }
}
