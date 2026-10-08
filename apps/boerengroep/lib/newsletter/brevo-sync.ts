import type { NewsletterStatusData } from '@sites/cms/newsletter-status';
import type { Brevo, BrevoPerson } from '../email/brevo';

/**
 * Keeps the Brevo list in step with the people who signed up on the site.
 *
 * The site's own subscriber table is the record of consent. Brevo only receives
 * people who confirmed their email, and loses them again when they leave.
 * Nothing here throws: a visitor confirming their address must never see an
 * error because Brevo is unreachable.
 */

export type SyncOutcome =
  | { status: 'done' }
  | { status: 'skipped'; reason: 'no-key' | 'no-list' }
  | { status: 'failed'; error: string };

/** What the site knows about its subscribers. */
export type SiteSubscribers = { confirmed: BrevoPerson[]; left: string[]; waiting: number };

/** The shape the admin panel reads. Defined next to the panel so the two cannot drift apart. */
export type NewsletterStatus = NewsletterStatusData;

type Deps = {
  brevo: Brevo;
  /** The list this site's subscribers belong on. Null when none is chosen yet. */
  listId: () => Promise<number | null>;
  report: (problem: string) => void;
};

const NO_LIST = 'No list is chosen yet. Fill in the list number above and save.';
const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export function createNewsletterSync({ brevo, listId, report }: Deps) {
  /** Runs one change on the list, with the checks every change needs. */
  async function onList(
    describe: (id: number) => string,
    change: (id: number) => Promise<{ ok: true } | { ok: false; error: string }>,
  ): Promise<SyncOutcome> {
    if (!brevo.configured) return { status: 'skipped', reason: 'no-key' };
    try {
      const id = await listId();
      if (id === null) return { status: 'skipped', reason: 'no-list' };
      const result = await change(id);
      if (result.ok) return { status: 'done' };
      report(`${describe(id)}: ${result.error}`);
      return { status: 'failed', error: result.error };
    } catch (error) {
      report(`Brevo sync failed: ${message(error)}`);
      return { status: 'failed', error: message(error) };
    }
  }

  /** Compares the site with the list. */
  async function compare(site: SiteSubscribers, id: number) {
    const onBrevo = await brevo.listContacts(id);
    if (!onBrevo.ok) return onBrevo;
    const listed = new Set(onBrevo.emails);
    return {
      ok: true as const,
      people: listed.size,
      missing: site.confirmed.filter((p) => !listed.has(p.email.toLowerCase())),
      stale: site.left.filter((email) => listed.has(email.toLowerCase())),
    };
  }

  return {
    /** Someone clicked the link in the confirmation email. */
    confirmed: (email: string, language: string) =>
      onList(
        (id) => `Brevo did not add ${email} to list ${id}`,
        (id) => brevo.addToList(email, id, language),
      ),

    /** Someone unsubscribed. They stay known to Brevo, but off the list. */
    unsubscribed: (email: string) =>
      onList(
        (id) => `Brevo did not remove ${email} from list ${id}`,
        (id) => brevo.removeFromList(email, id),
      ),

    /** Someone asked for their data to be erased. This does not depend on a list. */
    async deleted(email: string): Promise<SyncOutcome> {
      if (!brevo.configured) return { status: 'skipped', reason: 'no-key' };
      const result = await brevo.deleteContact(email);
      if (result.ok) return { status: 'done' };
      report(`Brevo did not delete ${email}: ${result.error}`);
      return { status: 'failed', error: result.error };
    },

    /** Everything an editor needs to see whether the link with Brevo works. */
    async status(site: SiteSubscribers): Promise<NewsletterStatus> {
      const counts = { confirmed: site.confirmed.length, waiting: site.waiting, left: site.left.length };
      const key = await brevo.check();
      if (!key.ok) {
        return {
          key,
          list: { ok: false, error: 'The key has to work before the list can be checked.' },
          site: counts,
          missing: null,
          stale: null,
        };
      }

      const lists = await brevo.listLists();
      const available = lists.ok ? lists.lists : undefined;
      const id = await listId().catch(() => null);
      const chosen = available?.find((l) => l.id === id);
      if (id === null || !chosen) {
        const error = !lists.ok
          ? lists.error
          : id === null
            ? NO_LIST
            : `There is no list with number ${id} in this Brevo account.`;
        return { key, list: { ok: false, error, available }, site: counts, missing: null, stale: null };
      }

      const compared = await compare(site, id);
      if (!compared.ok) {
        return { key, list: { ok: false, error: compared.error, available }, site: counts, missing: null, stale: null };
      }
      return {
        key,
        list: { ok: true, id, name: chosen.name, people: compared.people },
        site: counts,
        missing: compared.missing.length,
        stale: compared.stale.length,
      };
    },

    /** Adds everyone who is missing from the list and removes everyone who left. Safe to run again. */
    async syncAll(
      site: SiteSubscribers,
    ): Promise<{ ok: true; added: number; removed: number } | { ok: false; error: string }> {
      try {
        const id = await listId();
        if (id === null) return { ok: false, error: NO_LIST };
        const compared = await compare(site, id);
        if (!compared.ok) return compared;
        const added = await brevo.importToList(compared.missing, id);
        if (!added.ok) return added;
        const removed = await brevo.removeManyFromList(compared.stale, id);
        if (!removed.ok) return removed;
        return { ok: true, added: compared.missing.length, removed: compared.stale.length };
      } catch (error) {
        return { ok: false, error: message(error) };
      }
    },
  };
}

export type NewsletterSync = ReturnType<typeof createNewsletterSync>;
