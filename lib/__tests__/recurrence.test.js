import { describe, expect, it } from 'vitest'
import {
  COUNT,
  MAX_COUNT,
  MAX_INTERVAL,
  NEVER,
  NONE,
  UNTIL,
  describeRule,
  occurrences,
  ruleFrom,
  sortDays,
  validateRecurrence
} from '../recurrence'
import { describeSeries, groupSeries } from '../series'

const START = '2026-10-06T18:00'

const shown = (form, limit) =>
  occurrences(START, ruleFrom(form), limit).map(date =>
    date.toDateString().slice(0, 10)
  )

describe('ruleFrom', () => {
  it('builds the shape the server expects', () => {
    expect(
      ruleFrom({ frequency: 'weekly', interval: 2, endsType: COUNT, count: '4' })
    ).toEqual({
      frequency: 'weekly',
      interval: 2,
      byDay: [],
      ends: { type: COUNT, count: 4 }
    })
  })

  it('is nothing for a one-off', () => {
    expect(ruleFrom({ frequency: NONE })).toBeNull()
    expect(ruleFrom({})).toBeNull()
  })

  it('only a weekly series keeps its weekdays', () => {
    expect(ruleFrom({ frequency: 'monthly', byDay: ['TU'] }).byDay).toEqual([])
    expect(
      ruleFrom({ frequency: 'weekly', byDay: ['TH', 'MO', 'TH'] }).byDay
    ).toEqual(['MO', 'TH'])
  })

  it('carries an end date through', () => {
    expect(
      ruleFrom({ frequency: 'weekly', endsType: UNTIL, until: '2026-11-05' }).ends
    ).toEqual({ type: UNTIL, until: '2026-11-05' })
  })

  it('carries no ending at all when it never ends', () => {
    expect(ruleFrom({ frequency: 'weekly', endsType: NEVER }).ends).toEqual({
      type: NEVER
    })
  })
})

describe('sortDays', () => {
  it('puts the week back in order and drops repeats', () => {
    expect(sortDays(['SU', 'MO', 'SU', 'WE'])).toEqual(['MO', 'WE', 'SU'])
  })

  it('ignores anything that is not a day', () => {
    expect(sortDays(['MO', 'XX'])).toEqual(['MO'])
    expect(sortDays(null)).toEqual([])
  })
})

describe('validateRecurrence', () => {
  it('is happy with a one-off', () => {
    expect(validateRecurrence({ frequency: NONE })).toBeNull()
    expect(validateRecurrence({})).toBeNull()
  })

  it('accepts each way of ending', () => {
    expect(
      validateRecurrence({ frequency: 'weekly', endsType: COUNT, count: 4 })
    ).toBeNull()
    expect(
      validateRecurrence({
        frequency: 'weekly',
        endsType: UNTIL,
        until: '2026-11-05',
        start: START
      })
    ).toBeNull()
    expect(validateRecurrence({ frequency: 'weekly', endsType: NEVER })).toBeNull()
  })

  it('needs at least two dates', () => {
    expect(
      validateRecurrence({ frequency: 'weekly', endsType: COUNT, count: 1 })
    ).toMatch(/at least 2/)
  })

  it('refuses a runaway count', () => {
    expect(
      validateRecurrence({
        frequency: 'weekly',
        endsType: COUNT,
        count: MAX_COUNT + 1
      })
    ).toMatch(String(MAX_COUNT))
  })

  it('refuses a silly interval', () => {
    for (const interval of [0, -1, MAX_INTERVAL + 1, 1.5]) {
      expect(validateRecurrence({ frequency: 'weekly', interval })).toMatch(
        /Repeat every/
      )
    }
  })

  it('needs the end date to come after the start', () => {
    expect(
      validateRecurrence({
        frequency: 'weekly',
        endsType: UNTIL,
        until: '2026-09-01',
        start: START
      })
    ).toMatch(/after the first date/)
  })

  it('needs an end date at all when ending on one', () => {
    expect(validateRecurrence({ frequency: 'weekly', endsType: UNTIL })).toMatch(
      /Pick the date/
    )
  })
})

describe('occurrences', () => {
  it('steps a week at a time', () => {
    expect(shown({ frequency: 'weekly', endsType: COUNT, count: 3 })).toEqual([
      'Tue Oct 06',
      'Tue Oct 13',
      'Tue Oct 20'
    ])
  })

  it('steps by the interval', () => {
    expect(
      shown({ frequency: 'weekly', interval: 2, endsType: COUNT, count: 3 })
    ).toEqual(['Tue Oct 06', 'Tue Oct 20', 'Tue Nov 03'])
  })

  it('does twice a week', () => {
    expect(
      shown({
        frequency: 'weekly',
        byDay: ['TU', 'TH'],
        endsType: COUNT,
        count: 4
      })
    ).toEqual(['Tue Oct 06', 'Thu Oct 08', 'Tue Oct 13', 'Thu Oct 15'])
  })

  it('does weekdays only', () => {
    expect(
      shown({
        frequency: 'weekly',
        byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
        endsType: COUNT,
        count: 5
      })
    ).toEqual([
      'Tue Oct 06',
      'Wed Oct 07',
      'Thu Oct 08',
      'Fri Oct 09',
      'Mon Oct 12'
    ])
  })

  it('never goes back before the first date', () => {
    const dates = occurrences(
      START,
      ruleFrom({ frequency: 'weekly', byDay: ['MO'], endsType: COUNT, count: 2 })
    )
    expect(dates.every(date => date >= new Date(START))).toBe(true)
  })

  it('stops on the end date', () => {
    expect(
      shown({ frequency: 'weekly', endsType: UNTIL, until: '2026-10-21' })
    ).toEqual(['Tue Oct 06', 'Tue Oct 13', 'Tue Oct 20'])
  })

  it('keeps going when it never ends, up to the limit asked for', () => {
    expect(shown({ frequency: 'weekly', endsType: NEVER }, 12)).toHaveLength(12)
  })

  it('steps months and skips the ones without that day', () => {
    const dates = occurrences(
      '2026-01-31T18:00',
      ruleFrom({ frequency: 'monthly', endsType: COUNT, count: 3 })
    )
    expect(dates.map(d => d.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-03-31',
      '2026-05-31'
    ])
  })

  it('steps days', () => {
    expect(shown({ frequency: 'daily', endsType: COUNT, count: 3 })).toEqual([
      'Tue Oct 06',
      'Wed Oct 07',
      'Thu Oct 08'
    ])
  })

  it('gives nothing back for a date it cannot read', () => {
    expect(occurrences('not a date', ruleFrom({ frequency: 'weekly' }))).toEqual(
      []
    )
  })

  it('gives one date back when there is no rule', () => {
    expect(occurrences(START, null)).toHaveLength(1)
  })
})

describe('describeRule', () => {
  it('says what the series does', () => {
    expect(
      describeRule(ruleFrom({ frequency: 'weekly', endsType: COUNT, count: 4 }))
    ).toBe('Weekly · 4 dates')
    expect(
      describeRule(
        ruleFrom({
          frequency: 'weekly',
          byDay: ['TU', 'TH'],
          endsType: COUNT,
          count: 6
        })
      )
    ).toBe('Weekly on Tuesday and Thursday · 6 dates')
    expect(
      describeRule(
        ruleFrom({ frequency: 'weekly', interval: 2, endsType: COUNT, count: 3 })
      )
    ).toBe('Every 2 weeks · 3 dates')
    expect(
      describeRule(ruleFrom({ frequency: 'weekly', endsType: NEVER }))
    ).toBe('Weekly · ongoing')
  })

  it('says nothing without a rule', () => {
    expect(describeRule(null)).toBeNull()
  })
})

describe('groupSeries', () => {
  const one = { id: 'a', startTime: '2026-09-14T18:00:00Z' }
  const s1 = { id: 'b', seriesId: 'S', startTime: '2026-09-15T18:00:00Z' }
  const s2 = { id: 'c', seriesId: 'S', startTime: '2026-09-22T18:00:00Z' }
  const s3 = { id: 'd', seriesId: 'S', startTime: '2026-09-29T18:00:00Z' }

  it('collapses a series into one group', () => {
    const groups = groupSeries([one, s1, s2, s3])
    expect(groups).toHaveLength(2)
    expect(groups[1].count).toBe(3)
    expect(groups[1].lead).toBe(s1)
  })

  it('keeps one-off events on their own', () => {
    const groups = groupSeries([one])
    expect(groups[0].count).toBe(1)
    expect(groups[0].key).toBe('a')
  })

  it('keeps the order the list arrived in', () => {
    const groups = groupSeries([s1, one, s2])
    expect(groups.map(g => g.key)).toEqual(['S', 'a'])
  })

  it('copes with nothing', () => {
    expect(groupSeries([])).toEqual([])
    expect(groupSeries(null)).toEqual([])
  })

  it('describes the span of a series', () => {
    const [, series] = groupSeries([one, s1, s2, s3])
    expect(describeSeries(series)).toMatch(/3 dates/)
  })

  it('says nothing for a single event', () => {
    expect(describeSeries(groupSeries([one])[0])).toBeNull()
  })
})
