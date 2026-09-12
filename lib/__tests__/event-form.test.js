import { describe, expect, it } from 'vitest'
import { formFromEvent, payloadFromForm, toISO, toLocalInput } from '../event-form'

describe('toLocalInput', () => {
  it('round-trips through toISO without drifting', () => {
    const original = '2026-10-01T17:30'
    expect(toLocalInput(toISO(original))).toBe(original)
  })

  it('round-trips across a daylight-saving boundary', () => {
    for (const value of ['2026-03-29T02:30', '2026-10-25T02:30']) {
      expect(toLocalInput(toISO(value))).toBe(value)
    }
  })

  it('renders a UTC instant in local time, not by slicing the string', () => {
    const iso = '2026-10-01T17:00:00Z'
    const expected = new Date(iso)
    const [, hh, mm] = toLocalInput(iso).match(/T(\d{2}):(\d{2})$/)
    expect(Number(hh)).toBe(expected.getHours())
    expect(Number(mm)).toBe(expected.getMinutes())
  })

  it('returns empty for missing or unparseable values', () => {
    expect(toLocalInput(null)).toBe('')
    expect(toLocalInput('nonsense')).toBe('')
  })
})

describe('formFromEvent', () => {
  it('coerces nulls to empty strings so inputs stay controlled', () => {
    const form = formFromEvent({
      title: 'A thing',
      description: null,
      startTime: null,
      endTime: null,
      eventLink: null,
      rsvpFormUrl: null,
      tags: null
    })

    expect(form.description).toBe('')
    expect(form.eventLink).toBe('')
    expect(form.rsvpFormUrl).toBe('')
    expect(form.tags).toEqual([])
  })

  it('fills the time fields from UTC timestamps', () => {
    const form = formFromEvent({ startTime: '2026-10-01T17:00:00Z' })
    expect(form.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('payloadFromForm', () => {
  it('sends timestamps as UTC ISO strings', () => {
    const payload = payloadFromForm({
      title: 'T',
      description: 'D',
      start: '2026-10-01T17:00',
      end: '2026-10-01T19:00',
      eventLink: '',
      rsvpFormUrl: '',
      tags: []
    })

    expect(payload.start.endsWith('Z')).toBe(true)
    expect(payload.end.endsWith('Z')).toBe(true)
  })
})
