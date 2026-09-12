import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearEventsCache, getEvents } from '../data'

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

const page = rows => ({ ok: true, json: async () => ({ rows }) })

// Every page after the ones given comes back empty, which is how the loader
// knows to stop.
const mockPages = (...pages) => {
  const spy = vi.spyOn(globalThis, 'fetch')
  pages.forEach(rows => spy.mockResolvedValueOnce(page(rows)))
  return spy.mockResolvedValue(page([]))
}

const mockRows = rows => mockPages(rows)

beforeEach(() => {
  clearEventsCache()
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.EVENTS_CACHE_MS
})

describe('getEvents', () => {
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

describe('getEvents caching', () => {
  it('serves a second call from cache instead of refetching', async () => {
    process.env.EVENTS_CACHE_MS = '30000'
    const fetchSpy = mockRows([row()])

    await getEvents()
    const afterFirst = fetchSpy.mock.calls.length
    await getEvents()

    expect(fetchSpy.mock.calls.length).toBe(afterFirst)
  })

  it('shares one in-flight request between concurrent callers', async () => {
    process.env.EVENTS_CACHE_MS = '30000'
    const fetchSpy = mockRows([row()])

    await Promise.all([getEvents(), getEvents(), getEvents()])
    const shared = fetchSpy.mock.calls.length
    clearEventsCache()
    mockRows([row()])
    await getEvents()

    expect(fetchSpy.mock.calls.length).toBe(shared * 2)
  })

  it('refetches once the TTL has passed', async () => {
    process.env.EVENTS_CACHE_MS = '0'
    const fetchSpy = mockRows([row()])

    await getEvents()
    const afterFirst = fetchSpy.mock.calls.length
    await getEvents()

    expect(fetchSpy.mock.calls.length).toBeGreaterThan(afterFirst)
  })

  it('does not cache a failed fetch', async () => {
    process.env.EVENTS_CACHE_MS = '30000'
    // 400 is not in fetchJson's retryable list, so this fails immediately
    // rather than being retried into success.
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'nope'
      })
      .mockResolvedValueOnce(page([row()]))
      .mockResolvedValue(page([]))

    await expect(getEvents()).rejects.toThrow()
    expect(await getEvents()).toHaveLength(1)
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1)
  })
})

describe('getEvents pagination', () => {
  it('fetches a second page when the first one is full', async () => {
    // Three rows then one: the short page marks the end.
    mockPages(
      [
        row({ id: 'a', Title: 'A', StartTime: '2026-10-01T17:00:00' }),
        row({ id: 'b', Title: 'B', StartTime: '2026-10-02T17:00:00' }),
        row({ id: 'c', Title: 'C', StartTime: '2026-10-03T17:00:00' })
      ],
      [row({ id: 'd', Title: 'D', StartTime: '2026-10-04T17:00:00' })]
    )

    const events = await getEvents()

    expect(events.map(e => e.title)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('stops after a single request when the first page is short', async () => {
    const fetchSpy = mockPages([row()])

    await getEvents()

    expect(fetchSpy.mock.calls.length).toBe(2)
  })

  it('orders across pages, not just within one', async () => {
    mockPages(
      [
        row({ id: 'late', Title: 'Late', StartTime: '2026-12-01T17:00:00' }),
        row({ id: 'mid', Title: 'Mid', StartTime: '2026-11-01T17:00:00' })
      ],
      [row({ id: 'early', Title: 'Early', StartTime: '2026-01-01T17:00:00' })]
    )

    const events = await getEvents()

    expect(events.map(e => e.title)).toEqual(['Early', 'Mid', 'Late'])
  })

  it('handles an empty first page', async () => {
    mockPages([])
    expect(await getEvents()).toEqual([])
  })
})
