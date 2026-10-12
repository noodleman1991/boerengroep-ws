import type { ConfirmationStatus, NewsletterStatusData } from '@sites/cms/newsletter-status';
import type { Brevo } from './brevo';

/**
 * The sign-up for the newsletter. Brevo is the list and the record of who agreed to what:
 * the site hands over an address, Brevo sends its confirmation email, and the person is on
 * the list after they click the button in it. The site keeps no list of its own.
 *
 * Nothing here throws: a visitor must get an answer, also when Brevo is unreachable.
 */

export type SignupResult =
  | { status: 'sent' }
  /** A copy of the site that must not send email. Nobody is passed on. */
  | { status: 'off' }
  | { status: 'not-ready'; reason: 'no-key' | 'no-list' | 'no-confirmation' }
  | { status: 'failed'; error: string };

/** The shape the admin panel reads. Defined next to the panel so the two cannot drift apart. */
export type NewsletterStatus = NewsletterStatusData;

type Deps = {
  /** The client, or a way to get it at the moment it is needed (the key can change while the site runs). */
  brevo: Brevo | (() => Promise<Brevo>);
  /** What an admin chose under Site settings, Newsletter, for a visitor who reads this language. */
  settings: (language: string) => Promise<{ listId: number | null; templateId: number | null }>;
  /** The page Brevo sends someone to after they confirmed. */
  confirmedUrl: (language: string) => string;
  /** The languages of the site, for the check in the admin panel. */
  languages: readonly string[];
  /** True on a copy of the site that must not send email, such as a laptop or a trial copy. */
  off: () => boolean;
  report: (problem: string) => void;
};

const NOT_READY = {
  'no-key': 'A visitor could not sign up for the newsletter: no Brevo key is saved under Site settings, Newsletter.',
  'no-list': 'A visitor could not sign up for the newsletter: no Brevo list is chosen under Site settings, Newsletter.',
  'no-confirmation':
    'A visitor could not sign up for the newsletter: no confirmation email is chosen under Site settings, Newsletter.',
} as const;

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** A number an admin typed counts only when it is a whole number above zero. */
export function wholeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

export function createNewsletter({ brevo: given, settings, confirmedUrl, languages, off, report }: Deps) {
  const client = async () => (typeof given === 'function' ? given() : given);

  return {
    /** Someone typed their address in the sign-up box. */
    async signUp(email: string, language: string): Promise<SignupResult> {
      if (off()) return { status: 'off' };
      try {
        const brevo = await client();
        const notReady = (reason: keyof typeof NOT_READY): SignupResult => {
          report(NOT_READY[reason]);
          return { status: 'not-ready', reason };
        };
        if (!brevo.configured) return notReady('no-key');
        const { listId, templateId } = await settings(language);
        if (listId === null) return notReady('no-list');
        if (templateId === null) return notReady('no-confirmation');

        const result = await brevo.requestConfirmation({ email, listId, templateId, redirectUrl: confirmedUrl(language), language });
        if (result.ok) return { status: 'sent' };
        // The address stays out of the log: it is personal, and the reason does not depend on it.
        report(`Brevo did not send the confirmation email: ${result.error}`);
        return { status: 'failed', error: result.error };
      } catch (error) {
        report(`Signing up for the newsletter failed: ${message(error)}`);
        return { status: 'failed', error: message(error) };
      }
    },

    /** Everything an admin needs to see whether the sign-up box works. */
    async status(): Promise<NewsletterStatus> {
      const brevo = await client();
      const key = await brevo.check();
      if (!key.ok) {
        return {
          off: off(),
          key,
          list: { ok: false, error: 'The key has to work before the list can be checked.' },
          confirmation: [],
        };
      }

      const chosen = await Promise.all(languages.map(async (language) => ({ language, ...(await settings(language)) })));

      const lists = await brevo.listLists();
      const available = lists.ok ? lists.lists : undefined;
      const listId = chosen[0]?.listId ?? null;
      const found = available?.find((l) => l.id === listId);
      const list: NewsletterStatus['list'] = found
        ? { ok: true, id: found.id, name: found.name, people: found.subscribers }
        : {
            ok: false,
            error: !lists.ok
              ? lists.error
              : listId === null
                ? 'No list is chosen yet. Fill in the list number below and save.'
                : `There is no list with number ${listId} in this Brevo account.`,
            available,
          };

      // Languages that use the same email are checked, and reported, once.
      const byTemplate = new Map<number | null, string[]>();
      for (const { language, templateId } of chosen) byTemplate.set(templateId, [...(byTemplate.get(templateId) ?? []), language]);
      const confirmation = await Promise.all(
        [...byTemplate].map(async ([id, speaks]): Promise<ConfirmationStatus> => {
          if (id === null) return { ok: false, languages: speaks, problem: 'none' };
          const template = await brevo.template(id);
          if (!template.ok) {
            return template.missing
              ? { ok: false, languages: speaks, problem: 'missing', id }
              : { ok: false, languages: speaks, problem: 'unreadable', id, error: template.error };
          }
          if (!template.active) return { ok: false, languages: speaks, problem: 'off', id, name: template.name };
          if (!template.confirmation) return { ok: false, languages: speaks, problem: 'no-button', id, name: template.name };
          return { ok: true, languages: speaks, id, name: template.name };
        }),
      );

      // Something to choose from, when a choice still has to be made or repaired.
      const templates = confirmation.every((c) => c.ok) ? undefined : await brevo.listTemplates();
      return { off: off(), key, list, confirmation, ...(templates?.ok ? { templates: templates.templates } : {}) };
    },
  };
}

export type Newsletter = ReturnType<typeof createNewsletter>;
