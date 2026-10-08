/**
 * Makes a page that carries every block once, so the browser tests have something to click
 * through. It is a tool for testing, not content: the texts only name the block they sit in,
 * and the page is a draft unless TEST_PAGE_PUBLISH=1. Running it again updates the same page.
 * Delete the page and the form "Test form" when you no longer need them.
 */
import { getPayload } from 'payload'
import config from '../dev.config'
import { requireEnv } from '../env'

const payload = await getPayload({ config })
const slug = requireEnv('TENANT_SLUG')
const tenants = await payload.find({ collection: 'tenants', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
const tenant = tenants.docs[0]?.id
if (tenant === undefined) throw new Error(`Site "${slug}" does not exist. Run the seed first.`)

const text = (value: string, format = 0) => ({ type: 'text', text: value, format, style: '', mode: 'normal', detail: 0, version: 1 })
const paragraph = (value: string) => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [text(value)] })
const rich = (...paragraphs: string[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: paragraphs.map(paragraph) } })

const mine = { tenant: { equals: tenant } }
const pictures = (
  await payload.find({ collection: 'media', where: { and: [mine, { mimeType: { contains: 'image/' } }] }, limit: 9, sort: '-filesize', overrideAccess: true })
).docs.map((doc) => doc.id)
const files = (
  await payload.find({ collection: 'media', where: { and: [mine, { mimeType: { not_like: 'image/' } }] }, limit: 3, overrideAccess: true })
).docs.map((doc) => doc.id)
const story = (await payload.find({ collection: 'past-events', where: mine, limit: 1, overrideAccess: true })).docs[0]

// A freely licensed test film that is certain to stay online.
const testVideo = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'

const formTitle = 'Test form'
const existingForm = (await payload.find({ collection: 'forms', where: { and: [mine, { title: { equals: formTitle } }] }, limit: 1, overrideAccess: true })).docs[0]
const form =
  existingForm ??
  (await payload.create({
    collection: 'forms',
    overrideAccess: true,
    data: {
      title: formTitle,
      tenant,
      submitButtonLabel: 'Send the test',
      confirmationType: 'message',
      confirmationMessage: rich('Thank you. This was a test.'),
      fields: [
        { blockType: 'text', name: 'name', label: 'Your name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        {
          blockType: 'select',
          name: 'size',
          label: 'Size',
          required: true,
          width: 50,
          options: [
            { label: 'Small', value: 's' },
            { label: 'Medium', value: 'm' },
            { label: 'Large', value: 'l' },
          ],
        },
        { blockType: 'number', name: 'amount', label: 'How many', width: 50, defaultValue: 1 },
        { blockType: 'textarea', name: 'note', label: 'Anything else' },
        { blockType: 'checkbox', name: 'agree', label: 'I understand this is a test', required: true },
      ],
    } as never,
  }))

const pic = (index: number) => pictures[index % Math.max(1, pictures.length)]
const blocks: Record<string, unknown>[] = [
  {
    blockType: 'hero',
    layout: 'split',
    headline: 'Test page for blocks',
    tagline: 'This page exists to check how each block looks and works. It is not part of the site.',
    image: pictures.length ? { src: pic(0), alt: '' } : undefined,
    actions: [
      { label: 'First button', type: 'button', link: '/activities/calendar' },
      { label: 'A plain link', type: 'link', link: '/' },
    ],
  },
  { blockType: 'eventsCalendarPreview', background: 'mist', mode: 'upcoming', count: 4, showMiniCalendar: true },
  { blockType: 'callout', background: 'harvest', text: 'Announcement block: one line that links somewhere', url: '/activities/calendar' },
  { blockType: 'content', width: 'narrow', body: rich('Text block, first paragraph, at reading width.', 'Text block, second paragraph.') },
  {
    blockType: 'imageText',
    background: 'mist',
    layout: 'image-right',
    image: pictures.length ? { src: pic(1), alt: '' } : undefined,
    content: rich('Picture with text block, first paragraph.', 'Picture with text block, second paragraph.'),
  },
  {
    blockType: 'features',
    title: 'Highlights block',
    description: 'Line under the title.',
    items: [
      { title: 'First item', text: rich('Text of the first item.') },
      { title: 'Second item', text: rich('Text of the second item.') },
      { title: 'Third item', text: rich('Text of the third item.') },
    ],
  },
  {
    blockType: 'stats',
    background: 'leaf',
    title: 'Numbers block',
    description: 'Line under the title.',
    stats: [
      { stat: '12', type: 'first number' },
      { stat: '345', type: 'second number' },
      { stat: '6.789', type: 'third number' },
    ],
  },
  {
    blockType: 'testimonial',
    title: 'Quotes block',
    testimonials: [
      { quote: 'Text of the first quote.', author: 'First name', role: 'who they are' },
      { quote: 'Text of the second quote.', author: 'Second name', role: 'who they are' },
    ],
  },
  { blockType: 'video', url: testVideo, caption: 'Video block: plays only after pressing play.' },
  ...(pictures.length
    ? [
        {
          blockType: 'gallery',
          background: 'mist',
          title: 'Photo gallery block',
          intro: 'A few words above the photos.',
          source: 'pictures',
          images: pictures.slice(0, 6),
          videos: [{ url: testVideo, caption: 'A video among the photos' }],
        },
      ]
    : []),
  ...(story ? [{ blockType: 'gallery', title: 'Gallery of a past event', source: 'pastEvent', pastEvent: story.id }] : []),
  ...(files.length ? [{ blockType: 'documents', title: 'Downloads block', files: files.map((file) => ({ file })) }] : []),
  { blockType: 'podcast', background: 'mist', mode: 'latest', count: 2 },
  {
    blockType: 'item',
    title: 'Item block',
    images: pictures.slice(2, 5),
    details: rich('Details of the item, first paragraph.', 'Details of the item, second paragraph.'),
    priceText: '€ 0',
    actionType: 'form',
    buttonLabel: 'Ask for one',
    form: form.id,
  },
  { blockType: 'form', background: 'mist', title: 'Form block', intro: rich('Text above the form.'), form: form.id },
  { blockType: 'newsletterSignup', background: 'harvest' },
  {
    blockType: 'cta',
    background: 'dark',
    title: 'Invitation block',
    description: 'Text of the invitation.',
    actions: [{ label: 'The button', type: 'button', link: '/contact' }],
  },
]

const legacyId = 'test/blocks'
const existing = (await payload.find({ collection: 'pages', where: { and: [mine, { legacyId: { equals: legacyId } }] }, limit: 1, draft: true, overrideAccess: true })).docs[0]
const data = {
  title: 'Test page for blocks',
  slug: 'test-blocks',
  tenant,
  legacyId,
  blocks,
  _status: process.env.TEST_PAGE_PUBLISH === '1' ? 'published' : 'draft',
}
const page = existing
  ? await payload.update({ collection: 'pages', id: existing.id, locale: 'en', data: data as never, overrideAccess: true })
  : await payload.create({ collection: 'pages', locale: 'en', data: data as never, overrideAccess: true })

payload.logger.info(`Test page ${existing ? 'updated' : 'created'} (id ${page.id}, ${data._status}) with ${blocks.length} blocks`)
process.exit(0)
