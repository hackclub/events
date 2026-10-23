import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  adminSlackIds,
  attendeeAccess,
  isAdmin,
  limitAttendee
} from '../rsvp-access'

const HOST = 'U0123ABCDEF'
const ADMIN = 'U0ADMIN1234'
const STRANGER = 'U0STRANGER1'

beforeEach(() => {
  vi.stubEnv('ADMIN_SLACK_IDS', ` ${ADMIN} ,U0OTHERADMN`)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('admins', () => {
  it('reads a comma-separated list and ignores blanks', () => {
    expect(adminSlackIds('U1, U2,,')).toEqual(['U1', 'U2'])
    expect(adminSlackIds('')).toEqual([])
  })

  it('only counts listed Slack IDs', () => {
    expect(isAdmin(ADMIN)).toBe(true)
    expect(isAdmin(HOST)).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })

  it('has nobody when the list is unset', () => {
    vi.stubEnv('ADMIN_SLACK_IDS', '')
    expect(isAdmin(ADMIN)).toBe(false)
  })
})

describe('attendeeAccess', () => {
  it('gives admins everything on any event', () => {
    expect(attendeeAccess(ADMIN, HOST)).toBe('full')
    expect(attendeeAccess(ADMIN, ADMIN)).toBe('full')
  })

  it('limits the host', () => {
    expect(attendeeAccess(HOST, HOST)).toBe('limited')
  })

  it('shows nobody else the list', () => {
    expect(attendeeAccess(STRANGER, HOST)).toBe('none')
    expect(attendeeAccess(null, HOST)).toBe('none')
    expect(attendeeAccess(null, null)).toBe('none')
    expect(attendeeAccess(undefined, undefined)).toBe('none')
  })
})

describe('limitAttendee', () => {
  it('keeps only the Slack display name and Slack ID', () => {
    expect(
      limitAttendee({
        sub: 'ident!abc',
        slackId: 'U0RSVPER123',
        name: 'Legal Name',
        email: 'person@example.com',
        slackDisplayName: 'orpheus',
        rsvpedAt: '2026-10-01T12:00:00Z'
      })
    ).toEqual({ slackId: 'U0RSVPER123', slackDisplayName: 'orpheus' })
  })

  it('fills gaps with null rather than leaking anything else', () => {
    expect(limitAttendee({ name: 'Legal Name', email: 'a@b.c' })).toEqual({
      slackId: null,
      slackDisplayName: null
    })
  })
})
