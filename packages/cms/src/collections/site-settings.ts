import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'
import { linkFields } from '../fields/link'
import { rowLabel } from '../fields/row-label'

/** Keeps the hidden title equal to the name of the organisation. */
const nameAsTitle: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  const name = data.general?.name ?? originalDoc?.general?.name
  data.title = name ? `Settings of ${name}` : 'Site settings'
  return data
}

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
          description:
            'The menu at the top of every page. Drag items to change their order. An item can have a dropdown with more links.',
          fields: [
            {
              name: 'nav',
              type: 'array',
              label: 'Menu items',
              labels: { singular: 'Menu item', plural: 'Menu items' },
              admin: rowLabel('label', 'Menu item'),
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
                  label: 'Dropdown',
                  labels: { singular: 'Dropdown link', plural: 'Dropdown links' },
                  admin: {
                    description: 'Optional. Links that appear when someone opens this menu item.',
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
            {
              name: 'columns',
              type: 'array',
              label: 'Link columns',
              labels: { singular: 'Column', plural: 'Columns' },
              admin: { description: 'Two or three short columns read best.', components: rowLabel('title', 'Column').components },
              fields: [
                { name: 'title', type: 'text', localized: true },
                {
                  name: 'links',
                  type: 'array',
                  labels: { singular: 'Link', plural: 'Links' },
                  admin: rowLabel('label', 'Link'),
                  fields: linkFields(),
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Small links at the very bottom',
              labels: { singular: 'Link', plural: 'Links' },
              admin: { description: 'For example the privacy policy.', components: rowLabel('label', 'Link').components },
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
