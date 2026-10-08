/**
 * Brevo keeps the newsletter list. This site decides who is on it:
 * people are added when they confirm their email, and removed when they leave.
 *
 * API reference: https://developers.brevo.com/reference
 */

const API = 'https://api.brevo.com/v3';
const NO_KEY = 'No Brevo API key is set for this site.';
const PAGE = 500; // The most contacts Brevo returns per request.
const MAX_PAGES = 40;
const REMOVE_GROUP = 150;

export type BrevoResult = { ok: true } | { ok: false; error: string };
export type BrevoList = { id: number; name: string; subscribers: number };
export type BrevoPerson = { email: string; language: string };

type Options = { apiKey: string | undefined; fetchImpl?: typeof fetch };
type Answer = { status: number; json?: any; error?: string };

const clean = (email: string) => email.toLowerCase().trim();
const withLanguage = (person: BrevoPerson) => ({
  email: clean(person.email),
  attributes: { LANGUAGE: person.language.toUpperCase() },
});

export function createBrevo({ apiKey, fetchImpl = fetch }: Options) {
  const key = apiKey?.trim() || undefined;

  /** One request. Never throws: a refusal or a network failure comes back as a reason. */
  async function call(method: string, path: string, body?: unknown): Promise<Answer> {
    try {
      const response = await fetchImpl(`${API}${path}`, {
        method,
        headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': key! },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      const json = await response.json().catch(() => null);
      return { status: response.status, json };
    } catch (error) {
      return { status: 0, error: error instanceof Error ? error.message : 'Request failed' };
    }
  }

  const reason = (answer: Answer): string =>
    answer.error ?? answer.json?.message ?? answer.json?.error ?? `Brevo answered with status ${answer.status}`;

  /** The language is a contact attribute that has to exist in the Brevo account. Without it the person still counts. */
  const attributeRefused = (answer: Answer) => answer.status === 400 && /attribute/i.test(reason(answer));

  return {
    configured: Boolean(key),

    async addToList(email: string, listId: number, language: string): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      const base = { email: clean(email), listIds: [listId], updateEnabled: true };
      let answer = await call('POST', '/contacts', { ...base, attributes: { LANGUAGE: language.toUpperCase() } });
      if (attributeRefused(answer)) answer = await call('POST', '/contacts', base);
      // 201 is a new contact, 204 an existing one that was updated.
      return answer.status === 201 || answer.status === 204 ? { ok: true } : { ok: false, error: reason(answer) };
    },

    async removeFromList(email: string, listId: number): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('POST', `/contacts/lists/${listId}/contacts/remove`, { emails: [clean(email)] });
      // Brevo answers 400 when the person is not on the list. For us that is the wanted end state.
      const alreadyGone = answer.status === 400 && /already removed|does not exist/i.test(reason(answer));
      return answer.status === 201 || alreadyGone ? { ok: true } : { ok: false, error: reason(answer) };
    },

    async deleteContact(email: string): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('DELETE', `/contacts/${encodeURIComponent(clean(email))}`);
      return answer.status === 204 || answer.status === 404 ? { ok: true } : { ok: false, error: reason(answer) };
    },

    /** Many people at once. Brevo works through the group in the background. */
    async importToList(people: BrevoPerson[], listId: number): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      if (people.length === 0) return { ok: true };
      const base = {
        listIds: [listId],
        updateExistingContacts: true,
        emptyContactsAttributes: false,
        disableNotification: true,
      };
      let answer = await call('POST', '/contacts/import', { ...base, jsonBody: people.map(withLanguage) });
      if (attributeRefused(answer)) {
        answer = await call('POST', '/contacts/import', { ...base, jsonBody: people.map((p) => ({ email: clean(p.email) })) });
      }
      return answer.status === 202 ? { ok: true } : { ok: false, error: reason(answer) };
    },

    async removeManyFromList(emails: string[], listId: number): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      for (let start = 0; start < emails.length; start += REMOVE_GROUP) {
        const group = emails.slice(start, start + REMOVE_GROUP).map(clean);
        const answer = await call('POST', `/contacts/lists/${listId}/contacts/remove`, { emails: group });
        const alreadyGone = answer.status === 400 && /already removed|does not exist/i.test(reason(answer));
        if (answer.status !== 201 && !alreadyGone) return { ok: false, error: reason(answer) };
      }
      return { ok: true };
    },

    /** The email addresses of everyone on a list. */
    async listContacts(listId: number): Promise<{ ok: true; emails: string[] } | { ok: false; error: string }> {
      if (!key) return { ok: false, error: NO_KEY };
      const emails: string[] = [];
      for (let page = 0; page < MAX_PAGES; page++) {
        const answer = await call('GET', `/contacts/lists/${listId}/contacts?limit=${PAGE}&offset=${page * PAGE}`);
        if (answer.status !== 200) return { ok: false, error: reason(answer) };
        const contacts = (answer.json?.contacts ?? []) as Array<{ email?: string }>;
        for (const contact of contacts) if (contact.email) emails.push(clean(contact.email));
        if (contacts.length < PAGE) break;
      }
      return { ok: true, emails };
    },

    async listLists(): Promise<{ ok: true; lists: BrevoList[] } | { ok: false; error: string }> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('GET', '/contacts/lists?limit=50&offset=0');
      if (answer.status !== 200) return { ok: false, error: reason(answer) };
      const lists = (answer.json?.lists ?? []) as any[];
      return { ok: true, lists: lists.map((l) => ({ id: l.id, name: l.name, subscribers: l.uniqueSubscribers ?? 0 })) };
    },

    async check(): Promise<{ ok: true; account: string } | { ok: false; error: string }> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('GET', '/account');
      if (answer.status !== 200) return { ok: false, error: reason(answer) };
      return { ok: true, account: answer.json?.companyName || answer.json?.email || 'Brevo account' };
    },
  };
}

export type Brevo = ReturnType<typeof createBrevo>;

/** The client for this site, with the key from the server settings. */
export const brevo = createBrevo({ apiKey: process.env.BREVO_API_KEY });
