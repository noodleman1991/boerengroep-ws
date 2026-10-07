import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title of position' },
    slugField,
    languageField,
    {
      name: 'opportunityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Volunteer', value: 'volunteer' },
        { label: 'Internship', value: 'internship' },
        { label: 'Coordinator', value: 'coordinator' },
        { label: 'Board', value: 'board' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Remote', value: 'remote' },
            { label: 'In-person', value: 'in-person' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
        },
        { name: 'cityRegion', type: 'text', label: 'Where?' },
      ],
    },
    { name: 'startDate', type: 'date' },
    { name: 'duration', type: 'text' },
    { name: 'openApplication', type: 'checkbox', label: 'Open application (no deadline)' },
    { name: 'applicationDeadline', type: 'date' },
    { name: 'description', type: 'richText' },
    { name: 'responsibilities', type: 'richText' },
    { name: 'requiredSkills', type: 'text', hasMany: true },
    { name: 'preferredQualities', type: 'richText' },
    { name: 'languagesRequired', type: 'text', hasMany: true },
    { name: 'compensation', type: 'group', fields: [{ name: 'details', type: 'textarea' }] },
    { name: 'accessibilityNotes', type: 'textarea' },
    { name: 'howToApply', type: 'richText' },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'supportingDocument', type: 'upload', relationTo: 'media', label: 'Job description' },
    { name: 'valuesStatement', type: 'richText' },
    { name: 'openToNontraditional', type: 'checkbox' },
    legacyIdField,
  ],
}
