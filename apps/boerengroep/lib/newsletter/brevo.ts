/**
 * Brevo keeps the newsletter list, and everything about the people on it. This site only
 * hands over an address that was typed in the sign-up box: Brevo sends its confirmation
 * email, puts the person on the list when they click the button in it, and takes them off
 * when they unsubscribe. The site stores nothing about subscribers.
 *
 * API reference: https://developers.brevo.com/reference
 */

const API = 'https://api.brevo.com/v3';
const NO_KEY = 'No Brevo API key is set for this site.';

export type BrevoResult = { ok: true } | { ok: false; error: string };
export type BrevoList = { id: number; name: string; subscribers: number };
export type BrevoTemplate = { id: number; name: string; active: boolean };
export type ConfirmationRequest = {
  email: string;
  listId: number;
  /** The email with the confirmation button, made in Brevo. */
  templateId: number;
  /** Where Brevo sends the person after they clicked the button. */
  redirectUrl: string;
  language: string;
};

type Options = { apiKey: string | undefined; fetchImpl?: typeof fetch };
type Answer = { status: number; json?: any; error?: string };

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

    /** Brevo emails the person a button to confirm. Only after the click are they on the list. */
    async requestConfirmation({ email, listId, templateId, redirectUrl, language }: ConfirmationRequest): Promise<BrevoResult> {
      if (!key) return { ok: false, error: NO_KEY };
      const base = { email: email.toLowerCase().trim(), includeListIds: [listId], templateId, redirectionUrl: redirectUrl };
      const path = '/contacts/doubleOptinConfirmation';
      let answer = await call('POST', path, { ...base, attributes: { LANGUAGE: language.toUpperCase() } });
      if (attributeRefused(answer)) answer = await call('POST', path, base);
      // 201 is someone new, 204 someone Brevo already knew.
      return answer.status === 201 || answer.status === 204 ? { ok: true } : { ok: false, error: reason(answer) };
    },

    async listLists(): Promise<{ ok: true; lists: BrevoList[] } | { ok: false; error: string }> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('GET', '/contacts/lists?limit=50&offset=0');
      if (answer.status !== 200) return { ok: false, error: reason(answer) };
      const lists = (answer.json?.lists ?? []) as any[];
      return { ok: true, lists: lists.map((l) => ({ id: l.id, name: l.name, subscribers: l.uniqueSubscribers ?? 0 })) };
    },

    /**
     * One email template. `confirmation` is what Brevo itself says: does the email hold the
     * button that confirms a sign-up? Brevo leaves the answer out for some accounts, and then
     * the template gets the benefit of the doubt.
     */
    async template(
      id: number,
    ): Promise<{ ok: true; name: string; active: boolean; confirmation: boolean } | { ok: false; error: string; missing?: true }> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('GET', `/smtp/templates/${id}`);
      if (answer.status === 404) return { ok: false, error: reason(answer), missing: true };
      if (answer.status !== 200) return { ok: false, error: reason(answer) };
      return {
        ok: true,
        name: answer.json?.name ?? `Template ${id}`,
        active: answer.json?.isActive === true,
        confirmation: answer.json?.doiTemplate !== false,
      };
    },

    async listTemplates(): Promise<{ ok: true; templates: BrevoTemplate[] } | { ok: false; error: string }> {
      if (!key) return { ok: false, error: NO_KEY };
      const answer = await call('GET', '/smtp/templates?limit=50&offset=0');
      if (answer.status !== 200) return { ok: false, error: reason(answer) };
      const templates = (answer.json?.templates ?? []) as any[];
      return { ok: true, templates: templates.map((t) => ({ id: t.id, name: t.name, active: t.isActive === true })) };
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
