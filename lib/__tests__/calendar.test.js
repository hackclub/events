import { describe, expect, it } from 'vitest'
import {
  byMonth,
  hasDates,
  isHappeningNow,
  isPast,
  isUpcoming,
  past,
  upcoming,
  withTags
} from '../calendar'

const event = (start, end, extra = {}) => ({ start, end, ...extra })

const SEP_1 = event('2026-09-01T17:00:00Z', '2026-09-01T19:00:00Z')
const SEP_29 = event('2026-09-29T17:00:00Z', '2026-09-29T19:00:00Z')
const OCT_5 = event('2026-10-05T17:00:00Z', '2026-10-05T19:00:00Z')

describe('isUpcoming', () => {
  it('does not keep an event that already happened this month', () => {
    // The bug this replaces compared months, so on Sept 30 every earlier
    // September event still counted as upcoming and flooded the homepage.
    const sep30 = new Date('2026-09-30T12:00:00Z')
    expect(isUpcoming(SEP_1, sep30)).toBe(false)
    expect(isUpcoming(SEP_29, sep30)).toBe(false)
    expect(isUpcoming(OCT_5, sep30)).toBe(true)
  })

  it('keeps an event that ended within the grace window', () => {
    const justAfter = new Date('2026-09-01T20:00:00Z')
    expect(isUpcoming(SEP_1, justAfter)).toBe(true)
  })

  it('drops an event once the grace window passes', () => {
    const wellAfter = new Date('2026-09-01T21:30:00Z')
    expect(isUpcoming(SEP_1, wellAfter)).toBe(false)
  })

  it('keeps an event that has not started', () => {
    const before = new Date('2026-08-31T00:00:00Z')
    expect(isUpcoming(SEP_1, before)).toBe(true)
  })
})

describe('isHappeningNow', () => {
  it('is true only between start and end', () => {
    expect(isHappeningNow(SEP_1, new Date('2026-09-01T18:00:00Z'))).toBe(true)
    expect(isHappeningNow(SEP_1, new Date('2026-09-01T16:59:00Z'))).toBe(false)
    expect(isHappeningNow(SEP_1, new Date('2026-09-01T19:00:00Z'))).toBe(false)
  })
})

describe('upcoming and past', () => {
  const all = [OCT_5, SEP_1, SEP_29]
  const sep30 = new Date('2026-09-30T12:00:00Z')

  it('splits every dated event into exactly one bucket', () => {
    const u = upcoming(all, sep30)
    const p = past(all, sep30)
    expect(u.length + p.length).toBe(all.length)
    expect(u.some(e => p.includes(e))).toBe(false)
  })

  it('orders by start time', () => {
    expect(past(all, sep30).map(e => e.start)).toEqual([
      SEP_1.start,
      SEP_29.start
    ])
  })
})

describe('date guards', () => {
  it('rejects events with missing or unparseable dates', () => {
    expect(hasDates(event(null, null))).toBe(false)
    expect(hasDates(event('nonsense', 'nonsense'))).toBe(false)
    expect(hasDates(SEP_1)).toBe(true)
  })

  it('excludes undated events from both buckets rather than guessing', () => {
    const broken = event(null, null)
    const all = [SEP_1, broken]
    const at = new Date('2026-09-30T12:00:00Z')
    expect(upcoming(all, at)).not.toContain(broken)
    expect(past(all, at)).not.toContain(broken)
  })
})

describe('byMonth', () => {
  it('groups by the start month', () => {
    expect(Object.keys(byMonth([SEP_1, SEP_29, OCT_5]))).toEqual([
      '2026-09',
      '2026-10'
    ])
  })
})

describe('withTags', () => {
  const tagged = [
    event('2026-09-01T17:00:00Z', '2026-09-01T19:00:00Z', { tags: ['ama'] }),
    event('2026-09-02T17:00:00Z', '2026-09-02T19:00:00Z', { tags: ['workshop'] }),
    event('2026-09-03T17:00:00Z', '2026-09-03T19:00:00Z', {})
  ]

  it('returns everything when no tags are given', () => {
    expect(withTags(tagged, undefined)).toHaveLength(3)
    expect(withTags(tagged, '')).toHaveLength(3)
  })

  it('matches any of the requested tags', () => {
    expect(withTags(tagged, 'ama')).toHaveLength(1)
    expect(withTags(tagged, 'ama,workshop')).toHaveLength(2)
  })

  it('does not fall over on events without tags', () => {
    expect(withTags(tagged, 'nonexistent')).toHaveLength(0)
  })
})
