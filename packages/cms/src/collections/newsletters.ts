import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { articleBlocks } from '../blocks'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: { singular: 'News item', plural: 'News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organization', 'type', 'publishDate'],
    group: 'News and vacancies',
    description:
      'All news is here: your own news and news from friends. Which of the two an item is, you choose at "Whose news" on the item. The website shows them on two pages: your own under Newsletter, and news from friends under Friends News. An item is an article you write here, or a link to something elsewhere.',
    components: { beforeListTable: ['@/components/admin/news-filter#NewsFilter'] },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    languageField,
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Kind of item',
      options: [
        { label: 'Article written here', value: 'article' },
        { label: 'Link to another website', value: 'link' },
        { label: 'Announcement of an event', value: 'event' },
        { label: 'Short update', value: 'update' },
      ],
    },
    {
      name: 'organization',
      type: 'select',
      required: true,
      label: 'Whose news',
      options: [
        { label: 'Boerengroep', value: 'Boerengroep' },
        { label: 'Inspringtheater', value: 'Inspringtheater' },
        { label: 'News from friends', value: 'friends' },
      ],
      admin: { description: 'News from friends shows on its own page. The rest shows on the News page.' },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      label: 'Date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'The newest items come first.' },
    },
    { name: 'tags', type: 'text', hasMany: true, admin: { description: 'Optional words to group items. Press Enter after each one.' } },
    { name: 'externalLink', type: 'text', label: 'Link', admin: { description: 'For a link to another website: the full address, starting with https://.' } },
    { name: 'linkDescription', type: 'textarea', label: 'What the link is about' },
    { name: 'author', type: 'relationship', relationTo: 'speakers', label: 'Written by' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media', label: 'Picture' },
    { name: 'excerpt', type: 'richText', label: 'Short summary', admin: { description: 'Shown in the list of news.' } },
    {
      name: 'body',
      type: 'blocks',
      label: 'Content',
      labels: { singular: 'Block', plural: 'Blocks' },
      blocks: articleBlocks,
      admin: { description: 'The item itself, built from blocks from top to bottom.' },
    },
    { name: 'featured', type: 'checkbox', label: 'Put this item in the spotlight' },
    legacyIdField,
  ],
}
