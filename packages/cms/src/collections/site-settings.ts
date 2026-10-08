import type { CollectionBeforeValidateHook, CollectionConfig, FieldHook } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'
import { hintOf, isSealed, seal } from '../secrets'
import { linkFields } from '../fields/link'
import { helpSteps } from '../fields/help-steps'
import { rowLabel } from '../fields/row-label'

/** Keeps the hidden title equal to the name of the organisation. */
const nameAsTitle: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  const name = data.general?.name ?? originalDoc?.general?.name
  data.title = name ? `Settings of ${name}` : 'Site settings'
  return data
}

type KeySiblings = { brevoApiKey?: unknown; brevoApiKeyRemove?: unknown } | undefined

/**
 * The Brevo key is write-only. What an admin types is locked before it is saved. An empty box
 * keeps the key that is saved, so saving the settings for another reason never loses it.
 */
const lockKey: FieldHook = ({ value, siblingData, siblingDocWithLocales, previousValue, req }) => {
  if ((siblingData as KeySiblings)?.brevoApiKeyRemove) return null
  const typed = typeof value === 'string' ? value.trim() : ''
  if (typed && !isSealed(typed)) return seal(typed, req.payload.secret)
  return (siblingDocWithLocales as KeySiblings)?.brevoApiKey ?? previousValue ?? null
}

/**
 * The key never leaves the server, except for the server's own code that talks to Brevo.
 * The answer is "empty" and not "nothing": a hook that gives nothing leaves the value in place.
 */
const keepKeyIn: FieldHook = ({ value, context }) => (context?.revealSecrets === true ? value : null)

/** The last characters of the key, so an admin can tell which key is saved. Runs before the key is locked. */
const noteKey: FieldHook = ({ siblingData, siblingDocWithLocales, previousValue }) => {
  const siblings = siblingData as KeySiblings
  if (siblings?.brevoApiKeyRemove) return null
  const typed = typeof siblings?.brevoApiKey === 'string' ? siblings.brevoApiKey.trim() : ''
  if (typed && !isSealed(typed)) return hintOf(typed)
  return (siblingDocWithLocales as { brevoApiKeyHint?: unknown } | undefined)?.brevoApiKeyHint ?? previousValue ?? null
}

/** Only people who are logged in see which key is saved. The public site does not. */
const forPeopleWhoLogIn: FieldHook = ({ value, req }) => (req.user ? value : null)

/** For people who are logged in, and for the server's own code that sends the emails. */
const notForVisitors: FieldHook = ({ value, req, context }) => (req.user || context?.revealSecrets === true ? value : null)

/**
 * One document per site. Each tab holds the things that appear on every page.
 * The descriptions are written for editors: plain words, no system terms.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Site settings', plural: 'Site settings' },
  admin: {
    useAsTitle: 'title',
    group: 'Site settings',
    description:
      'The parts of the site that show on every page: name and logo, the menu, the footer, the newsletter box and the calendar options.',
  },
  access: {
    read: anyone,
    create: tenantAdminsOnly,
    update: tenantAdminsOnly,
    delete: tenantAdminsOnly,
  },
  hooks: { beforeValidate: [nameAsTitle] },
  fields: [
    // Only there so the admin panel can show a name instead of "ID: 1" at the top.
    { name: 'title', type: 'text', admin: { hidden: true } },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'general',
          label: 'General',
          description: 'Who you are and how to reach you. Shown in the header, the footer and when a page is shared.',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Name of the organisation' },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'One-line introduction',
              admin: { description: 'A short sentence about what you do. Shown next to the logo in the footer.' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Shown in the header. A wide image with a transparent background works best.',
              },
            },
            {
              name: 'logoOnDark',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo for dark backgrounds',
              admin: {
                description:
                  'Shown in the dark footer. Use a version with light lettering and a transparent background. Leave empty to use the standard light version.',
              },
            },
            {
              name: 'symbol',
              type: 'upload',
              relationTo: 'media',
              label: 'Symbol',
              admin: {
                description:
                  'The logo without its lettering, with a transparent background. It is shown large as decoration, for example at the top of a page without a picture. Leave empty to use the standard one.',
              },
            },
            {
              name: 'contact',
              type: 'group',
              label: 'Contact details',
              admin: { description: 'Shown in the footer. Leave a field empty to hide it.' },
              fields: [
                { name: 'address', type: 'textarea', admin: { description: 'One line per row, for example street, then postcode and town.' } },
                { name: 'email', type: 'email' },
                { name: 'phone', type: 'text' },
                {
                  name: 'notifyEmail',
                  type: 'email',
                  label: 'Send form answers and orders to',
                  // An internal address: it is not part of what the website shows or hands out.
                  access: { read: ({ req }) => Boolean(req.user) },
                  hooks: { afterRead: [notForVisitors] },
                  admin: {
                    description:
                      'Every answer to a form, and every order through an "Item for a donation", is also sent to this address, with what the person filled in. Empty: the email address above. Visitors do not see this address.',
                  },
                },
              ],
            },
            {
              name: 'social',
              type: 'array',
              label: 'Social media',
              labels: { singular: 'Account', plural: 'Accounts' },
              admin: { description: 'Shown as small links in the footer, in this order.', components: rowLabel('platform', 'Account').components },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Mastodon', value: 'mastodon' },
                    { label: 'Bluesky', value: 'bluesky' },
                    { label: 'X (Twitter)', value: 'x' },
                    { label: 'Signal or WhatsApp group', value: 'chat' },
                    { label: 'Something else', value: 'other' },
                  ],
                },
                { name: 'url', type: 'text', required: true, label: 'Address' },
              ],
            },
          ],
        },
        {
          name: 'header',
          label: 'Menu',
          description: 'The menu at the top of every page.',
          fields: [
            helpSteps('How to arrange the menu', [
              'Each row below is one item of the menu, from left to right on the website.',
              'To change the order, drag a row up or down by the six dots on its left.',
              'To change an item, click its row. It opens, and you can change its words and where it leads.',
              'To add an item, press "Add Menu item" under the last row. To remove one, press the three dots on the right of its row and choose Remove.',
              'An item can open a list of more links. Open the item and add them under "Links that drop down". Drag those to order them too.',
              'When you are done, press Save at the top right. The website changes within seconds.',
            ]),
            {
              name: 'nav',
              type: 'array',
              label: 'Menu items',
              labels: { singular: 'Menu item', plural: 'Menu items' },
              admin: { initCollapsed: true, components: rowLabel('label', 'Menu item').components },
              fields: [
                ...linkFields(),
                {
                  name: 'highlight',
                  type: 'checkbox',
                  label: 'Show as a button',
                  admin: { description: 'Use this for the one thing you most want visitors to do. One button is enough.' },
                },
                {
                  name: 'children',
                  type: 'array',
                  label: 'Links that drop down',
                  labels: { singular: 'Link', plural: 'Links' },
                  admin: {
                    initCollapsed: true,
                    description: 'Optional. Links that appear under this item when someone points at it or opens it. Drag to order them.',
                    components: rowLabel('label', 'Link').components,
                  },
                  fields: linkFields(),
                },
              ],
            },
          ],
        },
        {
          name: 'footer',
          label: 'Footer',
          description: 'The bottom of every page. Contact details and social media come from the General tab.',
          fields: [
            helpSteps('How to arrange the footer', [
              'The footer has columns of links. Each row below is one column, from left to right.',
              'Click a column to open it. Its title stands above its links.',
              'Drag columns, and the links inside a column, by the six dots to change their order.',
              'The small links at the very bottom are for things like the privacy statement. The first of them is also the link in the small print of the newsletter box.',
            ]),
            {
              name: 'columns',
              type: 'array',
              label: 'Link columns',
              labels: { singular: 'Column', plural: 'Columns' },
              admin: { initCollapsed: true, description: 'Two or three short columns read best.', components: rowLabel('title', 'Column').components },
              fields: [
                { name: 'title', type: 'text', localized: true },
                {
                  name: 'links',
                  type: 'array',
                  labels: { singular: 'Link', plural: 'Links' },
                  admin: { initCollapsed: true, components: rowLabel('label', 'Link').components },
                  fields: linkFields(),
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Small links at the very bottom',
              labels: { singular: 'Link', plural: 'Links' },
              admin: { initCollapsed: true, description: 'For example the privacy policy.', components: rowLabel('label', 'Link').components },
              fields: linkFields(),
            },
            {
              name: 'showNewsletter',
              type: 'checkbox',
              defaultValue: true,
              label: 'Show the newsletter box in the footer',
            },
          ],
        },
        {
          name: 'newsletter',
          label: 'Newsletter',
          description:
            'The sign-up box and what people read after signing up. Leave a text empty to use the standard wording.',
          fields: [
            {
              // A live check, not a stored value: do sign-ups arrive on the Brevo list?
              name: 'brevoStatus',
              type: 'ui',
              admin: { components: { Field: '@/components/admin/newsletter-status#NewsletterStatus' } },
            },
            {
              name: 'brevoListId',
              type: 'number',
              label: 'Brevo list number',
              admin: {
                description:
                  'People who confirm their email are added to this list in Brevo. You find the number in Brevo under Contacts, Lists, in the column "ID".',
              },
            },
            {
              // Before the key itself, so it sees what was typed before that is locked.
              name: 'brevoApiKeyHint',
              type: 'text',
              label: 'Brevo key that is saved',
              access: { read: ({ req }) => Boolean(req.user), update: () => false },
              hooks: { beforeChange: [noteKey], afterRead: [forPeopleWhoLogIn] },
              admin: {
                readOnly: true,
                description: 'The last four characters of the saved key, to recognise it by. Empty: no key is saved here, and the key of the hosting is used when there is one.',
              },
            },
            {
              name: 'brevoApiKey',
              type: 'text',
              label: 'New Brevo key',
              // Write-only: nobody can read it back, not even an admin.
              access: { read: () => false },
              hooks: { beforeChange: [lockKey], afterRead: [keepKeyIn] },
              admin: {
                autoComplete: 'off',
                description:
                  'Paste a key here and press Save to start using it. In Brevo: your name at the top right, "SMTP & API", "API keys", "Generate a new API key". The key is locked before it is saved and is never shown again: this box stays empty, and leaving it empty keeps the saved key.',
              },
            },
            {
              name: 'brevoApiKeyRemove',
              type: 'checkbox',
              virtual: true,
              label: 'Remove the saved Brevo key',
              admin: { description: 'Tick and press Save to stop using the saved key, for example after it was replaced in Brevo.' },
            },
            { name: 'heading', type: 'text', localized: true, label: 'Heading above the box' },
            { name: 'intro', type: 'textarea', localized: true, label: 'Short introduction' },
            { name: 'placeholder', type: 'text', localized: true, label: 'Hint inside the email field' },
            { name: 'buttonLabel', type: 'text', localized: true, label: 'Text on the button' },
            {
              name: 'consentText',
              type: 'textarea',
              localized: true,
              label: 'Small print under the box',
              admin: { description: 'A link to the privacy policy is added after this text automatically.' },
            },
            {
              name: 'thanksTitle',
              type: 'text',
              localized: true,
              label: 'Thank-you heading',
              admin: { description: 'Shown right after someone signs up, in place of the box.' },
            },
            {
              name: 'thanksMessage',
              type: 'richText',
              localized: true,
              label: 'Thank-you message',
              admin: { description: 'Tell people to look in their inbox for the confirmation email.' },
            },
            {
              name: 'confirmedTitle',
              type: 'text',
              localized: true,
              label: 'Heading after confirming',
              admin: { description: 'Shown on the page people land on when they click the link in the email.' },
            },
            { name: 'confirmedMessage', type: 'richText', localized: true, label: 'Message after confirming' },
          ],
        },
        {
          name: 'calendar',
          label: 'Calendar',
          description: 'How the calendar page looks and what visitors can do with it.',
          fields: [
            { name: 'intro', type: 'textarea', localized: true, label: 'Text above the calendar' },
            {
              name: 'defaultView',
              type: 'select',
              defaultValue: 'list',
              label: 'First view',
              options: [
                { label: 'Upcoming events as a list', value: 'list' },
                { label: 'Month grid', value: 'month' },
              ],
              admin: { description: 'Visitors can always switch. The list reads best on a phone.' },
            },
            {
              name: 'showSubscribe',
              type: 'checkbox',
              defaultValue: true,
              label: 'Let visitors subscribe to the calendar',
              admin: {
                description:
                  'Shows a button that adds all your events to their own Google, Apple or Outlook calendar and keeps them up to date.',
              },
            },
          ],
        },
      ],
    },
  ],
}
