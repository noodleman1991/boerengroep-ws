import type { Field } from 'payload'

/** Sections of the site that are built in, with the address each one lives at. */
export const SECTION_PATHS = {
  home: '/',
  calendar: '/activities/calendar',
  'past-events': '/activities/past-events',
  news: '/news',
  newsletter: '/news/newsletter',
  'friends-news': '/news/friends-news',
  podcast: '/library/podcast',
  vacancies: '/vacancies',
} as const

export type SectionKey = keyof typeof SECTION_PATHS

const SECTION_OPTIONS: { label: string; value: SectionKey }[] = [
  { label: 'Home', value: 'home' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Past events', value: 'past-events' },
  { label: 'News overview', value: 'news' },
  { label: 'Newsletter archive', value: 'newsletter' },
  { label: "Friends' news", value: 'friends-news' },
  { label: 'Podcast', value: 'podcast' },
  { label: 'Vacancies', value: 'vacancies' },
]

export type LinkValue = {
  linkType?: 'page' | 'section' | 'custom' | null
  page?: number | string | { id: number | string; path?: string | null } | null
  section?: string | null
  url?: string | null
  anchor?: string | null
}

/** Turns a link chosen in the admin into an address, without the language prefix. */
export function resolveLink(link: LinkValue | null | undefined): string | undefined {
  if (!link) return undefined
  let base: string | undefined
  const type = link.linkType ?? 'page'
  if (type === 'page') {
    base = link.page && typeof link.page === 'object' ? (link.page.path ?? undefined) : undefined
  } else if (type === 'section') {
    base = link.section ? SECTION_PATHS[link.section as SectionKey] : undefined
  } else {
    base = link.url?.trim() || undefined
  }
  if (!base) return undefined
  const anchor = link.anchor?.trim().replace(/^#/, '')
  return anchor ? `${base}#${anchor}` : base
}

type Sibling = { linkType?: string } | undefined

/**
 * The fields of one link: what it says and where it goes.
 * Editors pick a page or a built-in section from a list, so links do not break when an address changes.
 */
export function linkFields(): Field[] {
  return [
    {
      name: 'label',
      type: 'text',
      localized: true,
      admin: {
        description: 'The words people click on. Switch language at the top to fill in the other one.',
      },
    },
    {
      name: 'linkType',
      type: 'radio',
      label: 'Goes to',
      defaultValue: 'page',
      options: [
        { label: 'A page', value: 'page' },
        { label: 'A built-in section', value: 'section' },
        { label: 'Another address', value: 'custom' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        condition: (_data, sibling: Sibling) => (sibling?.linkType ?? 'page') === 'page',
        description: 'The link keeps working when this page is renamed or moved.',
      },
    },
    {
      name: 'section',
      type: 'select',
      options: SECTION_OPTIONS,
      admin: {
        condition: (_data, sibling: Sibling) => sibling?.linkType === 'section',
        description: 'Parts of the site that are always there, such as the calendar.',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'Address',
      admin: {
        condition: (_data, sibling: Sibling) => sibling?.linkType === 'custom',
        description: 'Starts with https:// for another website, or with / for an address on this site.',
      },
    },
    {
      name: 'anchor',
      type: 'text',
      label: 'Jump to',
      admin: {
        description: 'Optional. Jumps to one part of the page, for example "volunteers" on the vacancies page.',
      },
    },
  ]
}
