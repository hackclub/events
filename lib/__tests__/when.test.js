import { describe, expect, it } from 'vitest'
import { relativeDay } from '../when'

const NOW = new Date('2026-09-13T12:00:00Z').getTime()
const at = iso => relativeDay(iso, NOW)

describe('relativeDay', () => {
  it('names the days around today', () => {
    expect(at('2026-09-13T18:00:00Z')).toBe('Today')
    expect(at('2026-09-14T12:00:00Z')).toBe('Tomorrow')
    expect(at('2026-09-12T12:00:00Z')).toBe('Yesterday')
  })

  it('counts days within the week', () => {
    expect(at('2026-09-16T12:00:00Z')).toBe('In 3 days')
    expect(at('2026-09-10T12:00:00Z')).toBe('3 days ago')
  })

  it('switches to weeks further out', () => {
    expect(at('2026-09-21T12:00:00Z')).toBe('Next week')
    expect(at('2026-10-11T12:00:00Z')).toBe('In 4 weeks')
    expect(at('2026-09-05T12:00:00Z')).toBe('Last week')
    expect(at('2026-08-16T12:00:00Z')).toBe('4 weeks ago')
  })

  it('copes with a missing or broken date', () => {
    expect(at(null)).toBe('No date')
    expect(at('')).toBe('No date')
    expect(at('not a date')).toBe('No date')
  })
})
