import { describe, expect, it } from 'vitest'
import { payloadFromForm } from '../event-form'
import { validateSubmission } from '../event-submission'

const form = {
  title: 'Website Circle',
  description: 'Weekly build session.',
  start: '2026-10-01T19:00',
  end: '2026-10-01T20:00',
  eventLink: '',
  rsvpFormUrl: '',
  tags: [],
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    byDay: ['TU', 'TH'],
    endsType: 'count',
    count: 4,
    timezone: 'Europe/London'
  }
}

describe('what the form sends survives the proxy', () => {
  it('keeps the recurrence rule', () => {
    const payload = payloadFromForm(form)
    expect(payload.recurrence).toMatchObject({
      frequency: 'weekly',
      byDay: ['TU', 'TH'],
      ends: { type: 'count', count: 4 }
    })

    const { valid, values } = validateSubmission(payload)
    expect(valid).toBe(true)
    expect(values.recurrence).toMatchObject({
      frequency: 'weekly',
      byDay: ['TU', 'TH'],
      ends: { type: 'count', count: 4 }
    })
  })

  it('keeps the timezone', () => {
    const { values } = validateSubmission(payloadFromForm(form))
    expect(values.recurrence.timezone).toBe('Europe/London')
  })

  it('sends nothing for a one-off', () => {
    const { values } = validateSubmission(
      payloadFromForm({ ...form, recurrence: { frequency: 'once' } })
    )
    expect(values.recurrence).toBeNull()
  })
})
