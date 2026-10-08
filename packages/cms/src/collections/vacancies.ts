import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField, slugField } from '../fields/shared'

export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  labels: { singular: 'Vacancy', plural: 'Vacancies' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'opportunityType', 'applicationDeadline'],
    group: 'News and vacancies',
    description:
      'Ways to join in: volunteering, internships, coordinator and board positions. Each one shows on the Vacancies page under its kind. One vacancy holds both languages: write it in English, switch language at the top right and write it in Dutch. Until the Dutch is written, Dutch visitors read the English. Fill in what you know and leave the rest empty.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Title of the position' },
    slugField,
    {
      name: 'opportunityType',
      type: 'select',
      required: true,
      label: 'Kind of position',
      options: [
        { label: 'Volunteer', value: 'volunteer' },
        { label: 'Internship', value: 'internship' },
        { label: 'Coordinator', value: 'coordinator' },
        { label: 'Board', value: 'board' },
        { label: 'Other', value: 'other' },
      ],
      admin: { description: 'Decides under which heading the vacancy shows.' },
    },
    {
      name: 'location',
      type: 'group',
      label: 'Where',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'How',
          options: [
            { label: 'From home', value: 'remote' },
            { label: 'On location', value: 'in-person' },
            { label: 'Partly from home', value: 'hybrid' },
          ],
        },
        { name: 'cityRegion', type: 'text', label: 'Place' },
      ],
    },
    { name: 'startDate', type: 'date', label: 'Starts' },
    { name: 'duration', type: 'text', localized: true, label: 'How long', admin: { description: 'For example "6 months" or "one evening a week".' } },
    {
      name: 'openApplication',
      type: 'checkbox',
      label: 'Always open, no deadline',
      admin: { description: 'Tick this for positions people can always apply for. The vacancy then stays on the page until you remove it.' },
    },
    {
      name: 'applicationDeadline',
      type: 'date',
      label: 'Apply until',
      admin: {
        // A deadline means nothing for a position that is always open.
        condition: (data) => !data?.openApplication,
        description:
          'The last day people can apply. The day after, the vacancy shows as closed, and three days later it leaves the page. Without a date the vacancy stays open.',
      },
    },
    { name: 'description', type: 'richText', localized: true, label: 'About the position' },
    { name: 'responsibilities', type: 'richText', localized: true, label: 'What you will do' },
    { name: 'requiredSkills', type: 'text', hasMany: true, localized: true, label: 'Skills needed', admin: { description: 'Press Enter after each one.' } },
    { name: 'preferredQualities', type: 'richText', localized: true, label: 'Nice to have' },
    { name: 'languagesRequired', type: 'text', hasMany: true, localized: true, label: 'Languages', admin: { description: 'Press Enter after each one.' } },
    {
      name: 'compensation',
      type: 'group',
      label: 'What you get',
      fields: [{ name: 'details', type: 'textarea', localized: true, label: 'Details', admin: { description: 'For example an allowance, travel costs, meals.' } }],
    },
    {
      name: 'accessibilityNotes',
      type: 'textarea',
      localized: true,
      label: 'Accessibility',
      admin: { description: 'Anything people should know about the place or the work, for example stairs or physical work.' },
    },
    { name: 'howToApply', type: 'richText', localized: true, label: 'How to apply' },
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Who to contact',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'supportingDocument',
      type: 'upload',
      relationTo: 'media',
      label: 'Job description',
      admin: { description: 'Optional file, for example a PDF. Shown as a download with its name and size.' },
    },
    { name: 'valuesStatement', type: 'richText', localized: true, label: 'What we stand for' },
    {
      name: 'openToNontraditional',
      type: 'checkbox',
      label: 'Also open to people without the usual background',
      admin: { description: 'Adds a line that says so to the vacancy.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Put this vacancy in the spotlight',
      admin: { description: 'It then comes first wherever a page shows the open positions.' },
    },
    legacyIdField,
  ],
}
