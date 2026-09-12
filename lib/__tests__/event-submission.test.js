import { describe, expect, it } from 'vitest'
import { isNewTag, validateSubmission, MAX_TITLE } from '../event-submission'

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

  it('keeps tags that are not in the known list', () => {
    const { values } = validateSubmission(
      valid({ tags: ['workshop', 'not-a-known-tag', 'ama'] }),
      AT
    )
    expect(values.tags).toEqual(['workshop', 'not-a-known-tag', 'ama'])
  })

  it('ignores a tags value that is not an array', () => {
    expect(validateSubmission(valid({ tags: 'workshop' }), AT).values.tags).toEqual([])
  })

  it('never trusts an approved flag from the client', () => {
    const { values } = validateSubmission(valid({ approved: true }), AT)
    expect(values).not.toHaveProperty('approved')
  })
})

describe('validateSubmission in edit mode', () => {
  it('allows a start time in the past', () => {
    const { errors } = validateSubmission(
      valid({ start: '2026-09-01T17:00:00Z', end: '2026-09-01T19:00:00Z' }),
      AT,
      { requireFutureStart: false }
    )
    expect(errors.start).toBeUndefined()
  })

  it('still rejects a past start by default', () => {
    const { errors } = validateSubmission(
      valid({ start: '2026-09-01T17:00:00Z', end: '2026-09-01T19:00:00Z' }),
      AT
    )
    expect(errors.start).toBeDefined()
  })

  it('still requires end after start in edit mode', () => {
    const { errors } = validateSubmission(
      valid({ start: '2026-09-01T19:00:00Z', end: '2026-09-01T17:00:00Z' }),
      AT,
      { requireFutureStart: false }
    )
    expect(errors.end).toBeDefined()
  })
})

describe('tags', () => {
  it('accepts a tag that does not exist yet', () => {
    const { values } = validateSubmission(valid({ tags: ['movie-night'] }), AT)
    expect(values.tags).toEqual(['movie-night'])
  })

  it('normalises a typed name into a slug', () => {
    const { values } = validateSubmission(valid({ tags: ['  Movie Night!! '] }), AT)
    expect(values.tags).toEqual(['movie-night'])
  })

  it('drops names with nothing usable in them', () => {
    const { values } = validateSubmission(valid({ tags: ['!!!', '   '] }), AT)
    expect(values.tags).toEqual([])
  })

  it('removes duplicates that normalise to the same slug', () => {
    const { values } = validateSubmission(valid({ tags: ['AMA', 'ama', ' AMA '] }), AT)
    expect(values.tags).toEqual(['ama'])
  })

  it('turns a spaced name into a hyphenated slug rather than collapsing it', () => {
    const { values } = validateSubmission(valid({ tags: ['A M A'] }), AT)
    expect(values.tags).toEqual(['a-m-a'])
  })

  it('caps how many tags an event can carry', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    expect(validateSubmission(valid({ tags: many }), AT).values.tags).toHaveLength(6)
  })

  it('knows which tags are new', () => {
    expect(isNewTag('workshop')).toBe(false)
    expect(isNewTag('movie-night')).toBe(true)
  })
})
