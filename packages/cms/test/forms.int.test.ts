import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let bgEditor: any
let otherEditor: any
let form: { id: number | string }

describe('forms and their responses', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
    const mk = (email: string, tenant: number | string) =>
      payload.create({
        collection: 'users',
        data: { email, password: 'correct-horse-battery', tenants: [{ tenant, roles: ['editor'] }] } as never,
        overrideAccess: true,
      })
    bgEditor = await mk('bg@site.test', bg)
    otherEditor = await mk('it@site.test', other)
    form = await payload.create({
      collection: 'forms',
      data: {
        title: 'T-shirt order',
        tenant: bg,
        fields: [
          { blockType: 'text', name: 'name', label: 'Your name', required: true },
          { blockType: 'email', name: 'email', label: 'Email', required: true },
          { blockType: 'select', name: 'size', label: 'Size', options: [{ label: 'M', value: 'm' }, { label: 'L', value: 'l' }] },
        ],
        confirmationType: 'message',
        confirmationMessage: {
          root: {
            type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
            children: [
              {
                type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
                children: [{ type: 'text', text: 'Thanks, we will be in touch.', format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
              },
            ],
          },
        },
      } as never,
      overrideAccess: true,
    })
  })
  afterAll(async () => resetDb(payload))

  it('lets visitors read a form so the site can show it', async () => {
    const res = await payload.find({ collection: 'forms', overrideAccess: false })
    expect(res.docs.map((d: any) => d.title)).toEqual(['T-shirt order'])
  })

  it('does not accept a response straight through the public API', async () => {
    await expect(
      payload.create({
        collection: 'form-submissions',
        data: { form: form.id, tenant: bg, submissionData: [{ field: 'name', value: 'Spam' }] } as never,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/not allowed/)
  })

  it('shows responses to editors of the same site only', async () => {
    await payload.create({
      collection: 'form-submissions',
      data: { form: form.id, tenant: bg, submissionData: [{ field: 'name', value: 'Anna' }, { field: 'size', value: 'm' }] } as never,
      overrideAccess: true,
    })
    const own = await payload.find({ collection: 'form-submissions', user: bgEditor, overrideAccess: false })
    expect(own.totalDocs).toBe(1)
    const foreign = await payload.find({ collection: 'form-submissions', user: otherEditor, overrideAccess: false })
    expect(foreign.totalDocs).toBe(0)
  })

  it('hides responses from visitors', async () => {
    const res = await payload.find({ collection: 'form-submissions', overrideAccess: false }).catch((e) => e)
    expect(res instanceof Error ? 0 : res.totalDocs).toBe(0)
  })

  it('does not show one site its neighbour forms in the admin', async () => {
    const res = await payload.find({ collection: 'forms', user: otherEditor, overrideAccess: false })
    expect(res.totalDocs).toBe(0)
  })
})
