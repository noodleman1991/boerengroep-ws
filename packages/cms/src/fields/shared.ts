import type { Field } from 'payload'

/** Free text because content uses arbitrary Tailwind values such as bg-[#F28F07]/20. */
export const backgroundField: Field = {
  name: 'background',
  type: 'text',
  admin: { description: 'Tailwind background class, for example bg-background or bg-[#44AD39]/10.' },
}

export const iconField: Field = {
  name: 'icon',
  type: 'group',
  fields: [
    { name: 'name', type: 'text', admin: { description: 'Lucide icon name, for example ArrowRight.' } },
    { name: 'color', type: 'text' },
    { name: 'style', type: 'text' },
  ],
}

export const actionsField: Field = {
  name: 'actions',
  type: 'array',
  fields: [
    { name: 'label', type: 'text' },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Button', value: 'button' },
        { label: 'Link', value: 'link' },
      ],
    },
    iconField,
    { name: 'link', type: 'text' },
  ],
}

/** Empty means the document is shown in both locales. */
export const languageField: Field = {
  name: 'language',
  type: 'select',
  admin: { position: 'sidebar', description: 'Leave empty to show in both languages.' },
  options: [
    { label: 'English', value: 'en' },
    { label: 'Nederlands', value: 'nl' },
  ],
}

/** URL segment. Case is preserved because existing URLs contain capitals. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  admin: { position: 'sidebar' },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value)
      ? true
      : 'Use letters, numbers and hyphens only.',
}

/** Path of the Tina file this document was migrated from. */
export const legacyIdField: Field = {
  name: 'legacyId',
  type: 'text',
  index: true,
  admin: { readOnly: true, position: 'sidebar' },
}
