import { describe, expect, it } from 'vitest'
import { eventText } from './collections'

describe('the text of an event', () => {
  it('is the description', () => {
    expect(eventText({ description: 'Come along.' })).toBe('Come along.')
  })

  it('takes a longer text from a second field along, once, when a site has one', () => {
    expect(eventText({ description: 'Come along.', fullDescription: 'Bring a friend.\n' })).toBe('Come along.\n\nBring a friend.')
    expect(eventText({ description: 'Come along.', fullDescription: '' })).toBe('Come along.')
    expect(eventText({ description: 'Come along. Bring a friend.', fullDescription: 'Bring a friend.' })).toBe('Come along. Bring a friend.')
    expect(eventText({ fullDescription: 'Only this.' })).toBe('Only this.')
    expect(eventText({})).toBeUndefined()
  })
})
