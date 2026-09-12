import { describe, expect, it } from 'vitest'
import { validateSubmission, MAX_TITLE } from '../event-submission'

const AT = new Date('2026-09-12T12:00:00Z')

const valid = (overrides = {}) => ({
  title: 'Code in the Dark',
  description: 'We build a site with the CSS preview turned off.',
  start: '2026-10-01T17:00:00.000Z',
  end: '2026-10-01T19:00:00.000Z',
  tags: ['workshop'],
  ...overrides
})

describe('validateSubmission', () => {
  it('accepts a well formed submission', () => {
    const { valid: ok, errors } = validateSubmission(valid(), AT)
    expect(errors).toEqual({})
    expect(ok).toBe(true)
  })

  it('normalises times to ISO strings', () => {
    const { values } = validateSubmission(valid(), AT)
    expect(values.start).toBe('2026-10-01T17:00:00.000Z')
    expect(values.end).toBe('2026-10-01T19:00:00.000Z')
  })

  it('requires a title and a description', () => {
    const { errors } = validateSubmission(
      valid({ title: '   ', description: '' }),
      AT
    )
    expect(errors.title).toBeDefined()
    expect(errors.description).toBeDefined()
  })

  it('caps the title length', () => {
    const { errors } = validateSubmission(
      valid({ title: 'x'.repeat(MAX_TITLE + 1) }),
      AT
    )
    expect(errors.title).toBeDefined()
  })

  it('rejects a start time in the past', () => {
    const { errors } = validateSubmission(
      valid({ start: '2026-09-01T17:00:00Z', end: '2026-09-01T19:00:00Z' }),
      AT
    )
    expect(errors.start).toBeDefined()
  })

  it('rejects an end time at or before the start', () => {
    const { errors } = validateSubmission(
      valid({ end: '2026-10-01T17:00:00.000Z' }),
      AT
    )
    expect(errors.end).toBeDefined()
  })

  it('rejects an event longer than a day', () => {
    const { errors } = validateSubmission(
      valid({ end: '2026-10-03T17:00:00.000Z' }),
      AT
    )
    expect(errors.end).toBeDefined()
  })

  it('rejects non-https links, including javascript: urls', () => {
    expect(
      validateSubmission(valid({ eventLink: 'javascript:alert(1)' }), AT).errors
        .eventLink
    ).toBeDefined()
    expect(
      validateSubmission(valid({ rsvpFormUrl: 'javascript:alert(1)' }), AT)
        .errors.rsvpFormUrl
    ).toBeDefined()
    expect(
      validateSubmission(valid({ eventLink: 'http://example.com' }), AT).errors
        .eventLink
    ).toBeDefined()
  })

  it('accepts https links and passes them through', () => {
    const { values, errors } = validateSubmission(
      valid({
        eventLink: 'https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF',
        rsvpFormUrl: 'https://forms.hackclub.com/x'
      }),
      AT
    )
    expect(errors).toEqual({})
    expect(values.eventLink).toContain('https://')
    expect(values.rsvpFormUrl).toContain('https://')
  })

  it('drops tags that are not in the allowed list', () => {
    const { values } = validateSubmission(
      valid({ tags: ['workshop', 'not-a-real-tag', 'ama'] }),
      AT
    )
    expect(values.tags).toEqual(['workshop', 'ama'])
  })

  it('ignores a tags value that is not an array', () => {
    expect(validateSubmission(valid({ tags: 'workshop' }), AT).values.tags).toEqual([])
  })

  it('never trusts an approved flag from the client', () => {
    const { values } = validateSubmission(valid({ approved: true }), AT)
    expect(values).not.toHaveProperty('approved')
  })
})
