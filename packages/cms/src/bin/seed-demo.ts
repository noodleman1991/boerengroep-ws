/**
 * Makes a page called "Block examples" that shows every block once, filled with pictures the
 * site already has. Editors can open it to see what each block looks like and copy from it.
 * It is a draft unless DEMO_PUBLISH=1. Running it again updates the same page.
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

const formTitle = 'Example: order a T-shirt'
const existingForm = (await payload.find({ collection: 'forms', where: { and: [mine, { title: { equals: formTitle } }] }, limit: 1, overrideAccess: true })).docs[0]
const form =
  existingForm ??
  (await payload.create({
    collection: 'forms',
    overrideAccess: true,
    data: {
      title: formTitle,
      tenant,
      submitButtonLabel: 'Send my order',
      confirmationType: 'message',
      confirmationMessage: rich('Thank you! We keep a shirt aside for you. Pick it up and pay at the next Boerengroep Break.'),
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
        { blockType: 'textarea', name: 'note', label: 'Anything we should know' },
        { blockType: 'checkbox', name: 'pickup', label: 'I pick it up and pay in Wageningen', required: true },
      ],
    } as never,
  }))

const pic = (index: number) => pictures[index % Math.max(1, pictures.length)]
const blocks: Record<string, unknown>[] = [
  {
    blockType: 'hero',
    layout: 'split',
    headline: 'Every block on one page',
    tagline: 'This page shows what each building block looks like. Open it in the admin panel to see how each one is filled in.',
    image: pictures.length ? { src: pic(0), alt: '' } : undefined,
    actions: [
      { label: 'See the calendar', type: 'button', link: '/activities/calendar' },
      { label: 'Read about us', type: 'link', link: '/about-us' },
    ],
  },
  { blockType: 'eventsCalendarPreview', background: 'mist', mode: 'upcoming', count: 4, showMiniCalendar: true },
  { blockType: 'callout', text: 'A callout is one line that links somewhere', url: '/activities/calendar' },
  {
    blockType: 'content',
    width: 'narrow',
    body: rich(
      'Text is the block for anything you want to tell. This one uses the reading width, which is the most comfortable for longer texts.',
      'A second paragraph, to show the spacing between paragraphs. Inside a text you can also place pictures, files and videos.',
    ),
  },
  {
    blockType: 'imageText',
    background: 'mist',
    layout: 'image-right',
    image: pictures.length ? { src: pic(1), alt: '' } : undefined,
    content: rich('Picture with text puts a photo beside a few paragraphs. You choose the side of the picture.', 'It works well for introducing a project or a person.'),
  },
  {
    blockType: 'features',
    title: 'Three things side by side',
    description: 'The features block is for short items of equal weight.',
    items: [
      { title: 'Learn', text: rich('Talks, lectures and film nights about farming and food.') },
      { title: 'Do', text: rich('Excursions to farms, workshops and work weekends.') },
      { title: 'Eat', text: rich('Open Pot: cooking and eating together, every week.') },
    ],
  },
  {
    blockType: 'stats',
    background: 'leaf',
    title: 'Numbers',
    description: 'For a few figures that say something.',
    stats: [
      { stat: '1971', type: 'founded' },
      { stat: '42', type: 'events last year' },
      { stat: '300', type: 'newsletter readers' },
    ],
  },
  {
    blockType: 'testimonial',
    title: 'What people say',
    testimonials: [
      { quote: 'I came for the soup and stayed for the discussions.', author: 'Anna', role: 'student in Wageningen' },
      { quote: 'The farm weekend changed how I look at my studies.', author: 'Joris', role: 'former intern' },
    ],
  },
  { blockType: 'video', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', caption: 'A video plays only after a visitor presses play.' },
  ...(pictures.length ? [{ blockType: 'gallery', background: 'mist', title: 'A photo gallery', source: 'pictures', images: pictures.slice(0, 7) }] : []),
  ...(story ? [{ blockType: 'gallery', title: 'The photos of a past event', source: 'pastEvent', pastEvent: story.id }] : []),
  ...(files.length ? [{ blockType: 'documents', title: 'Files to download', files: files.map((file) => ({ file })) }] : []),
  { blockType: 'podcast', background: 'mist', mode: 'latest', count: 2 },
  {
    blockType: 'item',
    title: 'Boerengroep T-shirt',
    images: pictures.slice(2, 5),
    details: rich('Organic cotton, printed in Wageningen. Sizes S to L.', 'You pick it up and pay at one of our evenings.'),
    priceText: '€15, or pay what you can',
    actionType: 'form',
    buttonLabel: 'Order a shirt',
    form: form.id,
  },
  { blockType: 'form', background: 'mist', title: 'A form on its own', intro: rich('The same form as above, placed directly on the page.'), form: form.id },
  { blockType: 'newsletterSignup', background: 'harvest' },
  {
    blockType: 'cta',
    background: 'dark',
    title: 'A closing call',
    description: 'The call to action block ends a page with one clear next step.',
    actions: [{ label: 'Get in touch', type: 'button', link: '/contact' }],
  },
]

const legacyId = 'demo/block-examples'
const existing = (await payload.find({ collection: 'pages', where: { and: [mine, { legacyId: { equals: legacyId } }] }, limit: 1, draft: true, overrideAccess: true })).docs[0]
const data = {
  title: 'Block examples',
  slug: 'block-examples',
  tenant,
  legacyId,
  blocks,
  _status: process.env.DEMO_PUBLISH === '1' ? 'published' : 'draft',
}
const page = existing
  ? await payload.update({ collection: 'pages', id: existing.id, locale: 'en', data: data as never, overrideAccess: true })
  : await payload.create({ collection: 'pages', locale: 'en', data: data as never, overrideAccess: true })

payload.logger.info(`Block examples page ${existing ? 'updated' : 'created'} (id ${page.id}, ${data._status}) with ${blocks.length} blocks`)
process.exit(0)
