import { describe, expect, it } from 'vitest'
import { answerEmail, notifyAddress } from './forms-notify'

const form = {
  title: 'Order a T-shirt',
  fields: [
    { blockType: 'text', name: 'name', label: 'Your name' },
    { blockType: 'email', name: 'email', label: 'Email' },
    { blockType: 'select', name: 'size', label: 'Size', options: [{ label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }] },
    { blockType: 'checkbox', name: 'agree', label: 'I understand this is a donation' },
    { blockType: 'textarea', name: 'note', label: 'Anything else' },
  ],
}
const data = [
  { field: 'name', value: 'Jan <b>de Boer</b>' },
  { field: 'email', value: 'jan@example.org' },
  { field: 'size', value: 'l' },
  { field: 'agree', value: 'true' },
  { field: 'note', value: '' },
]

describe('where a copy of a form answer goes', () => {
  it('goes to the address set for it', () => {
    expect(notifyAddress({ general: { contact: { email: 'info@example.org', notifyEmail: ' orders@example.org ' } } })).toBe('orders@example.org')
  })
  it('goes to the organisation’s own address when none is set', () => {
    expect(notifyAddress({ general: { contact: { email: 'info@example.org', notifyEmail: '' } } })).toBe('info@example.org')
  })
  it('goes nowhere when the site has no address at all', () => {
    expect(notifyAddress({ general: { contact: {} } })).toBeUndefined()
    expect(notifyAddress(null)).toBeUndefined()
  })
})

describe('the email about a form answer', () => {
  const mail = answerEmail({ site: 'Stichting Boerengroep', form, data })

  it('names the form in its subject', () => {
    expect(mail.subject).toBe('New answer: Order a T-shirt')
  })
  it('lists every question with its answer, in the words of the form', () => {
    expect(mail.text).toContain('Your name: Jan <b>de Boer</b>')
    expect(mail.text).toContain('Size: Large')
    expect(mail.text).toContain('I understand this is a donation: Yes')
    expect(mail.text).toContain('Anything else: -')
  })
  it('lets the organisation answer the person directly', () => {
    expect(mail.replyTo).toBe('jan@example.org')
    expect(mail.text).toContain('Answer this email to write to them.')
  })
  it('says so when the person left no address', () => {
    const anonymous = answerEmail({ site: 'X', form, data: data.filter((row) => row.field !== 'email') })
    expect(anonymous.replyTo).toBeUndefined()
    expect(anonymous.text).toContain('They left no email address.')
  })
  it('does not let an answer write its own HTML into the email', () => {
    expect(mail.html).toContain('Jan &lt;b&gt;de Boer&lt;/b&gt;')
    expect(mail.html).not.toContain('<b>de Boer</b>')
  })
  it('does not reply to something that is not an address', () => {
    const odd = answerEmail({ site: 'X', form, data: [{ field: 'email', value: 'jan@example.org\\nBcc: all@example.org' }] })
    expect(odd.replyTo).toBeUndefined()
  })
  it('falls back to the field name for a question the form no longer has', () => {
    expect(answerEmail({ site: 'X', form: { title: '', fields: [] }, data: [{ field: 'old', value: 'x' }] })).toMatchObject({ subject: 'New answer: a form' })
  })
})
