import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  labels: { singular: 'Vacancy', plural: 'Vacancies' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'opportunityType', 'applicationDeadline'],
    group: 'News and vacancies',
    description:
      'Ways to join in: volunteering, internships, coordinator and board positions. Each one shows on the Vacancies page under its kind. Fill in what you know and leave the rest empty.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title of the position' },
    slugField,
    languageField,
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
    { name: 'duration', type: 'text', label: 'How long', admin: { description: 'For example "6 months" or "one evening a week".' } },
    { name: 'openApplication', type: 'checkbox', label: 'Always open, no deadline' },
    { name: 'applicationDeadline', type: 'date', label: 'Apply before', admin: { description: 'After this date the vacancy shows as closed.' } },
    { name: 'description', type: 'richText', label: 'About the position' },
    { name: 'responsibilities', type: 'richText', label: 'What you will do' },
    { name: 'requiredSkills', type: 'text', hasMany: true, label: 'Skills needed', admin: { description: 'Press Enter after each one.' } },
    { name: 'preferredQualities', type: 'richText', label: 'Nice to have' },
    { name: 'languagesRequired', type: 'text', hasMany: true, label: 'Languages', admin: { description: 'Press Enter after each one.' } },
    {
      name: 'compensation',
      type: 'group',
      label: 'What you get',
      fields: [{ name: 'details', type: 'textarea', label: 'Details', admin: { description: 'For example an allowance, travel costs, meals.' } }],
    },
    {
      name: 'accessibilityNotes',
      type: 'textarea',
      label: 'Accessibility',
      admin: { description: 'Anything people should know about the place or the work, for example stairs or physical work.' },
    },
    { name: 'howToApply', type: 'richText', label: 'How to apply' },
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
    { name: 'valuesStatement', type: 'richText', label: 'What we stand for' },
    { name: 'openToNontraditional', type: 'checkbox', label: 'Also open to people without the usual background' },
    legacyIdField,
  ],
}
