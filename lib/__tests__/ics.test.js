import { describe, expect, it } from 'vitest'
import { buildCalendar, escape, fold, seriesBlocks, stamp, uidFor } from '../ics'

const NOW = new Date('2026-09-01T09:00:00Z')

const single = {
  id: 'e1',
  slug: 'code-in-the-dark',
  title: 'Code in the Dark',
  start: '2026-10-01T18:00:00Z',
  end: '2026-10-01T20:00:00Z',
  desc: 'Bring a laptop.'
}

const occurrence = (n, overrides = {}) => ({
  id: `s${n}`,
  seriesId: 'SERIES',
  slug: `website-circle-${n}`,
  title: 'Website Circle',
  start: `2026-10-0${n}T18:00:00Z`,
  end: `2026-10-0${n}T19:00:00Z`,
  occurrenceStart: `2026-10-0${n}T18:00:00Z`,
  seriesRule: n === 1 ? 'FREQ=WEEKLY;COUNT=3' : null,
  cancelled: false,
  ...overrides
})

const lines = text => text.split('\r\n')

describe('stamp', () => {
  it('writes UTC the way iCalendar wants it', () => {
    expect(stamp('2026-10-01T18:00:00Z')).toBe('20261001T180000Z')
  })

  it('is nothing for a date it cannot read', () => {
    expect(stamp('not a date')).toBeNull()
  })
})

describe('escape', () => {
  it('escapes the characters that would break a line', () => {
    expect(escape('a;b,c\\d')).toBe('a\\;b\\,c\\\\d')
    expect(escape('one\ntwo')).toBe('one\\ntwo')
  })

  it('copes with nothing', () => {
    expect(escape(null)).toBe('')
  })
})

describe('fold', () => {
  it('leaves a short line alone', () => {
    expect(fold('SUMMARY:Short')).toBe('SUMMARY:Short')
  })

  it('wraps a long line with a leading space', () => {
    const folded = fold(`SUMMARY:${'x'.repeat(200)}`)
    const parts = folded.split('\r\n')
    expect(parts.length).toBeGreaterThan(1)
    expect(parts[0]).toHaveLength(75)
    expect(parts.slice(1).every(part => part.startsWith(' '))).toBe(true)
  })

  it('loses nothing when it wraps', () => {
    const original = `SUMMARY:${'abc'.repeat(80)}`
    const rebuilt = fold(original)
      .split('\r\n')
      .map((part, i) => (i === 0 ? part : part.slice(1)))
      .join('')
    expect(rebuilt).toBe(original)
  })
})

describe('what every calendar client needs', () => {
  const ics = buildCalendar([single], { now: NOW })

  it('has the required envelope', () => {
    expect(lines(ics)[0]).toBe('BEGIN:VCALENDAR')
    expect(lines(ics).at(-1)).toBe('END:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
  })

  it('has a UID', () => {
    expect(ics).toContain(`UID:${uidFor(single)}`)
  })

  it('has a DTSTAMP', () => {
    expect(ics).toContain('DTSTAMP:20260901T090000Z')
  })

  it('carries the times', () => {
    expect(ics).toContain('DTSTART:20261001T180000Z')
    expect(ics).toContain('DTEND:20261001T200000Z')
  })

  it('links back to the page', () => {
    expect(ics).toContain('URL:https://events.hackclub.com/code-in-the-dark')
  })

  it('skips an event whose dates cannot be read', () => {
    const broken = buildCalendar([{ ...single, start: 'nope' }], { now: NOW })
    expect(broken).not.toContain('BEGIN:VEVENT')
  })
})

describe('a series becomes one repeating entry', () => {
  const group = [occurrence(1), occurrence(2), occurrence(3)]
  const ics = buildCalendar(group, { now: NOW })

  it('writes one VEVENT, not three', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
  })

  it('carries the rule', () => {
    expect(ics).toContain('RRULE:FREQ=WEEKLY;COUNT=3')
  })

  it('gives every date of the series one shared UID', () => {
    expect(ics).toContain('UID:SERIES@events.hackclub.com')
  })
})

describe('exceptions', () => {
  it('a skipped date becomes an EXDATE', () => {
    const group = [
      occurrence(1),
      occurrence(2, { cancelled: true }),
      occurrence(3)
    ]
    const ics = buildCalendar(group, { now: NOW })
    expect(ics).toContain('EXDATE:20261002T180000Z')
  })

  it('a moved date is excluded and re-added at its new time', () => {
    const group = [
      occurrence(1),
      occurrence(2, { start: '2026-10-09T18:00:00Z', end: '2026-10-09T19:00:00Z' }),
      occurrence(3)
    ]
    const ics = buildCalendar(group, { now: NOW })

    expect(ics).toContain('EXDATE:20261002T180000Z')
    expect(ics).toContain('RECURRENCE-ID:20261002T180000Z')
    expect(ics).toContain('DTSTART:20261009T180000Z')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
  })

  it('an override keeps its own UID distinct from the series', () => {
    const group = [
      occurrence(1),
      occurrence(2, { start: '2026-10-09T18:00:00Z', end: '2026-10-09T19:00:00Z' })
    ]
    const ics = buildCalendar(group, { now: NOW })
    expect(ics).toContain('UID:SERIES@events.hackclub.com-20261002T180000Z')
  })

  it('a cancelled one-off says so rather than vanishing', () => {
    const ics = buildCalendar([{ ...single, cancelled: true }], { now: NOW })
    expect(ics).toContain('STATUS:CANCELLED')
  })

  it('copes with a series whose every date is cancelled', () => {
    const group = [occurrence(1, { cancelled: true })]
    expect(seriesBlocks(group, { now: NOW })).toEqual([])
  })
})

describe('a mixed calendar', () => {
  it('keeps one-offs and series apart', () => {
    const ics = buildCalendar([single, occurrence(1), occurrence(2)], { now: NOW })
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('RRULE:FREQ=WEEKLY;COUNT=3')
    expect(ics).toContain('SUMMARY:Code in the Dark')
  })

  it('copes with nothing', () => {
    const ics = buildCalendar([], { now: NOW })
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })
})
