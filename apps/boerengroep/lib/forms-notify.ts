import type { FormField } from './forms';

/** Where a copy of every form answer goes: the address set for it, else the organisation's own. */
export function notifyAddress(settings: { general?: { contact?: { email?: string | null; notifyEmail?: string | null } | null } | null } | null | undefined): string | undefined {
  const contact = settings?.general?.contact;
  return contact?.notifyEmail?.trim() || contact?.email?.trim() || undefined;
}

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

/**
 * The email the organisation gets when someone fills in a form or orders an item: every
 * question with its answer, in the order of the form. Answering the email writes to the person
 * who filled it in, when they left an email address.
 */
export function answerEmail(input: {
  site: string;
  form: { title?: string | null; fields?: FormField[] | null };
  data: { field: string; value: string }[];
}): { subject: string; text: string; html: string; replyTo?: string } {
  const fields = input.form.fields ?? [];
  const title = input.form.title?.trim() || 'a form';
  const rows = input.data.map(({ field, value }) => {
    const about = fields.find((candidate) => candidate.name === field);
    const chosen = about?.options?.find((option) => option.value === value)?.label;
    const shown = about?.blockType === 'checkbox' ? (value === 'true' ? 'Yes' : 'No') : (chosen ?? value);
    return { label: about?.label?.trim() || field, value: shown, kind: about?.blockType };
  });
  const replyTo = rows.find((row) => row.kind === 'email' && EMAIL.test(row.value.trim()))?.value.trim();
  const intro = `Someone filled in "${title}" on the website of ${input.site}.`;
  const outro = replyTo ? 'Answer this email to write to them.' : 'They left no email address.';

  const text = [intro, '', ...rows.map((row) => `${row.label}: ${row.value || '-'}`), '', outro, 'You find all answers in the admin panel under Forms, Form responses.'].join('\n');
  const html = [
    `<p>${escape(intro)}</p>`,
    '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">',
    ...rows.map(
      (row) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid #dddddd;font-weight:600">${escape(row.label)}</th><td valign="top" style="border-bottom:1px solid #dddddd;white-space:pre-wrap">${escape(row.value || '-')}</td></tr>`,
    ),
    '</table>',
    `<p>${escape(outro)} You find all answers in the admin panel under Forms, Form responses.</p>`,
  ].join('\n');
  return { subject: `New answer: ${title}`, text, html, replyTo };
}
