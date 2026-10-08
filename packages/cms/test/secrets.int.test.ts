import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createQueries } from '../src/queries'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let admin: any
let editor: any
let settingsId: number | string

const KEY = 'xkeysib-0123456789abcdef-Zz9Q'
const queries = (tenantSlug: string) => createQueries({ getPayload: async () => payload, tenantSlug })
/** What the database really holds, without any hook or access rule in between. */
const stored = async () =>
  ((await payload.db.findOne({ collection: 'site-settings', where: { id: { equals: settingsId } } })) as any)?.newsletter

describe('the Brevo key saved in the settings', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
    const mk = (email: string, role: string) =>
      payload.create({ collection: 'users', data: { email, password: 'correct-horse-battery', tenants: [{ tenant: bg, roles: [role] }] } as never, overrideAccess: true })
    admin = await mk('admin@site.test', 'tenant-admin')
    editor = await mk('editor@site.test', 'editor')
    const settings = await payload.create({
      collection: 'site-settings',
      data: { tenant: bg, general: { name: 'Stichting Boerengroep' }, newsletter: { brevoListId: 7, brevoApiKey: KEY } } as never,
      user: { ...admin, collection: 'users' },
      overrideAccess: false,
    })
    settingsId = settings.id
  })
  afterAll(async () => resetDb(payload))

  it('is locked in the database, with only its last characters readable', async () => {
    const row = await stored()
    expect(row.brevoApiKey).toMatch(/^sealed:v1:/)
    expect(JSON.stringify(row)).not.toContain('xkeysib')
    expect(row.brevoApiKeyHint).toBe('…Zz9Q')
  })

  it('is given unlocked to the server code that talks to Brevo, for this site only', async () => {
    expect(await queries('boerengroep').getBrevoKey()).toBe(KEY)
    expect(await queries('inspringtheater').getBrevoKey()).toBeUndefined()
  })

  it('never comes back to anyone: not to a visitor, not to an admin, not to the site’s own pages', async () => {
    const asVisitor = await payload.findByID({ collection: 'site-settings', id: settingsId, overrideAccess: false })
    const asAdmin = await payload.findByID({ collection: 'site-settings', id: settingsId, overrideAccess: false, user: { ...admin, collection: 'users' } })
    // The site reads its settings with every access rule off, and passes them to pages.
    const asSite = await queries('boerengroep').getSiteSettings('en')
    for (const [who, doc] of Object.entries({ asVisitor, asAdmin, asSite })) {
      expect((doc as any).newsletter.brevoApiKey ?? null, who).toBeNull()
      expect(JSON.stringify(doc), who).not.toContain('sealed:v1')
      expect(JSON.stringify(doc), who).not.toContain('xkeysib')
    }
    // Which key is saved is told to people who are logged in, and to nobody else.
    expect((asAdmin as any).newsletter.brevoApiKeyHint).toBe('…Zz9Q')
    expect((asVisitor as any).newsletter.brevoApiKeyHint ?? null).toBeNull()
    expect((asSite as any).newsletter.brevoApiKeyHint ?? null).toBeNull()
  })

  it('stays when the settings are saved for another reason, with the key box empty', async () => {
    await payload.update({ collection: 'site-settings', id: settingsId, data: { newsletter: { brevoListId: 9 } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    await payload.update({ collection: 'site-settings', id: settingsId, data: { newsletter: { brevoListId: 9, brevoApiKey: '' } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    await payload.update({ collection: 'site-settings', id: settingsId, locale: 'nl', data: { newsletter: { heading: 'Blijf op de hoogte' } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    expect(await queries('boerengroep').getBrevoKey()).toBe(KEY)
    expect((await stored()).brevoApiKeyHint).toBe('…Zz9Q')
  })

  it('is replaced by a new one that is typed in', async () => {
    await payload.update({ collection: 'site-settings', id: settingsId, data: { newsletter: { brevoApiKey: '  xkeysib-new-key-AbCd ' } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    expect(await queries('boerengroep').getBrevoKey()).toBe('xkeysib-new-key-AbCd')
    expect((await stored()).brevoApiKeyHint).toBe('…AbCd')
  })

  it('cannot be set by an editor, who may not change the settings at all', async () => {
    await expect(
      payload.update({ collection: 'site-settings', id: settingsId, data: { newsletter: { brevoApiKey: 'xkeysib-from-an-editor' } } as never, user: { ...editor, collection: 'users' }, overrideAccess: false }),
    ).rejects.toThrow()
    expect(await queries('boerengroep').getBrevoKey()).toBe('xkeysib-new-key-AbCd')
  })

  it('is removed with the tick box, and the hint with it', async () => {
    await payload.update({ collection: 'site-settings', id: settingsId, data: { newsletter: { brevoApiKeyRemove: true } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    expect(await queries('boerengroep').getBrevoKey()).toBeUndefined()
    const row = await stored()
    expect(row.brevoApiKey ?? null).toBeNull()
    expect(row.brevoApiKeyHint ?? null).toBeNull()
  })

  it('keeps the address for form answers to people who are logged in and to the server', async () => {
    const withAddress = await payload.update({ collection: 'site-settings', id: settingsId, data: { general: { name: 'Stichting Boerengroep', contact: { email: 'info@site.test', notifyEmail: 'orders@site.test' } } } as never, user: { ...admin, collection: 'users' }, overrideAccess: false })
    expect((withAddress as any).general.contact.notifyEmail).toBe('orders@site.test')
    const asVisitor = await payload.findByID({ collection: 'site-settings', id: settingsId, overrideAccess: false })
    const asSite = await queries('boerengroep').getSiteSettings('en')
    for (const [who, doc] of Object.entries({ asVisitor, asSite })) {
      expect((doc as any).general.contact.notifyEmail ?? null, who).toBeNull()
      expect((doc as any).general.contact.email, who).toBe('info@site.test')
      expect(JSON.stringify(doc), who).not.toContain('orders@site.test')
    }
    expect(await queries('boerengroep').getContactForServer()).toMatchObject({ email: 'info@site.test', notifyEmail: 'orders@site.test' })
    expect(await queries('inspringtheater').getContactForServer()).toBeUndefined()
  })
})
