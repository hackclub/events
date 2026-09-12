import { describe, expect, it } from 'vitest'
import { plainTextFromRichText } from '../rich-text'

const wrap = text => ({
  type: 'rich_text',
  elements: [
    { type: 'rich_text_section', elements: [{ type: 'text', text }] }
  ]
})

describe('plainTextFromRichText', () => {
  it('reads the canonical rich-text shape', () => {
    expect(plainTextFromRichText(wrap('Venue fell through.'))).toBe(
      'Venue fell through.'
    )
  })

  it('reads it from a JSON string, which is how it arrives', () => {
    expect(plainTextFromRichText(JSON.stringify(wrap('No lead time.')))).toBe(
      'No lead time.'
    )
  })

  it('passes a legacy plain string straight through', () => {
    expect(plainTextFromRichText('cancelled, bad weather')).toBe(
      'cancelled, bad weather'
    )
  })

  it('keeps emoji shortcodes so the page can render them', () => {
    const block = {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_section',
          elements: [
            { type: 'text', text: 'sorry ' },
            { type: 'emoji', name: 'sadge' }
          ]
        }
      ]
    }
    expect(plainTextFromRichText(block)).toBe('sorry :sadge:')
  })

  it('uses link text rather than dropping the link', () => {
    const block = {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_section',
          elements: [{ type: 'link', url: 'https://x.com', text: 'details' }]
        }
      ]
    }
    expect(plainTextFromRichText(block)).toBe('details')
  })

  it('returns null when there is nothing to show', () => {
    expect(plainTextFromRichText(null)).toBeNull()
    expect(plainTextFromRichText('')).toBeNull()
    expect(plainTextFromRichText('   ')).toBeNull()
    expect(plainTextFromRichText(wrap(''))).toBeNull()
  })

  it('does not throw on malformed json', () => {
    expect(() => plainTextFromRichText('{"elements": ')).not.toThrow()
  })
})
