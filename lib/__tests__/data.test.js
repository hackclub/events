import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEvents } from '../data'

const row = (overrides = {}) => ({
  id: '8a20db4e-35e8-47a3-a075-d392173a86d9',
  Title: 'Code in the Dark',
  Description: 'On a live Zoom call...',
  StartTime: '2026-10-01T17:00:00',
  EndTime: '2026-10-01T19:00:00',
  Leader: 'amogh',
  CalendarLink: 'https://www.google.com/calendar/render?action=TEMPLATE',
  Avatar: 'https://cachet.hackclub.com/users/U123/r',
  Approved: true,
  Cancelled: false,
  Tags: ['workshop'],
  InterestCount: 4,
  LeaderSlackID: 'U123',
  RSVPFormURL: null,
  ...overrides
})

const mockRows = rows =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ rows })
  })

describe('getEvents', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps an Isabelle row onto the site event shape', async () => {
    mockRows([row()])
    const [event] = await getEvents()

    expect(event.title).toBe('Code in the Dark')
    expect(event.slug).toBe('code-in-the-dark')
    expect(event.leader).toBe('amogh')
    expect(event.tags).toEqual(['workshop'])
    expect(event.interestCount).toBe(4)
  })

  it('treats stored times as UTC', async () => {
    mockRows([row()])
    const [event] = await getEvents()

    expect(event.start).toBe('2026-10-01T17:00:00Z')
    expect(event.end).toBe('2026-10-01T19:00:00Z')
  })

  it('drops unapproved events', async () => {
    mockRows([row({ Approved: false })])
    expect(await getEvents()).toEqual([])
  })

  it('orders events by start time', async () => {
    mockRows([
      row({ id: 'b', Title: 'Later', StartTime: '2026-10-02T17:00:00' }),
      row({ id: 'a', Title: 'Earlier', StartTime: '2026-10-01T17:00:00' })
    ])
    expect((await getEvents()).map(e => e.title)).toEqual(['Earlier', 'Later'])
  })
})
