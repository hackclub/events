import { describe, expect, it } from 'vitest'
import { lastDateOnly, nextDateOnly } from '../calendar'

const hour = (start, end) => ({ start, end })

const occurrence = (id, start) => ({
  id,
  seriesId: 'S',
  title: 'Website Circle',
  ...hour(start, start.replace('T19:', 'T20:'))
})

const SERIES = [
  occurrence('a', '2026-09-24T19:00:00Z'),
  occurrence('b', '2026-10-01T19:00:00Z'),
  occurrence('c', '2026-10-08T19:00:00Z'),
  occurrence('d', '2026-10-15T19:00:00Z')
]

const ONE_OFF = {
  id: 'z',
  title: 'One off',
  ...hour('2026-10-09T10:00:00Z', '2026-10-09T11:00:00Z')
}

const at = iso => new Date(iso)

describe('nextDateOnly', () => {
  it('shows a series once', () => {
    const result = nextDateOnly(SERIES, at('2026-09-20T12:00:00Z'))
    expect(result).toHaveLength(1)
  })

  it('shows the date people can still turn up to', () => {
    const result = nextDateOnly(SERIES, at('2026-10-05T12:00:00Z'))
    expect(result[0].id).toBe('c')
  })

  it('moves on once a date has finished', () => {
    const before = nextDateOnly(SERIES, at('2026-10-08T19:30:00Z'))
    const after = nextDateOnly(SERIES, at('2026-10-09T12:00:00Z'))
    expect(before[0].id).toBe('c')
    expect(after[0].id).toBe('d')
  })

  it('counts the dates still to come', () => {
    const result = nextDateOnly(SERIES, at('2026-10-05T12:00:00Z'))
    expect(result[0].seriesCount).toBe(4)
    expect(result[0].seriesRemaining).toBe(1)
  })

  it('falls back to the last date once the series is over', () => {
    const result = nextDateOnly(SERIES, at('2026-12-01T12:00:00Z'))
    expect(result[0].id).toBe('d')
    expect(result[0].seriesRemaining).toBe(0)
  })

  it('leaves events that do not repeat alone', () => {
    const result = nextDateOnly([ONE_OFF], at('2026-10-01T12:00:00Z'))
    expect(result).toHaveLength(1)
    expect(result[0].seriesCount).toBeUndefined()
  })

  it('keeps everything in date order', () => {
    const result = nextDateOnly(
      [...SERIES, ONE_OFF],
      at('2026-10-05T12:00:00Z')
    )
    expect(result.map(e => e.id)).toEqual(['c', 'z'])
  })

  it('keeps two different series apart', () => {
    const other = { ...occurrence('q', '2026-10-02T19:00:00Z'), seriesId: 'T' }
    const result = nextDateOnly([...SERIES, other], at('2026-10-01T12:00:00Z'))
    expect(result).toHaveLength(2)
  })

  it('copes with nothing', () => {
    expect(nextDateOnly([], at('2026-10-01T12:00:00Z'))).toEqual([])
    expect(nextDateOnly(null, at('2026-10-01T12:00:00Z'))).toEqual([])
  })
})

describe('lastDateOnly', () => {
  it('shows a finished series once, as its final date', () => {
    const result = lastDateOnly(SERIES, at('2026-12-01T12:00:00Z'))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('d')
    expect(result[0].seriesCount).toBe(4)
  })

  it('leaves one-off events alone', () => {
    const result = lastDateOnly([ONE_OFF], at('2026-12-01T12:00:00Z'))
    expect(result[0].id).toBe('z')
  })
})
