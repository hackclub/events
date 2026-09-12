import { describe, expect, it } from 'vitest'
import {
  canCancel,
  canEdit,
  sortForReview,
  statusOf
} from '../event-status'
import { isUnestablished } from '../use-known-tags'

const pending = { id: 'a', leaderSlackId: 'U0LEADER' }
const approved = { ...pending, approved: true }
const cancelled = { ...approved, cancelled: true, cancellationType: 'cancelled' }
const rejected = { ...pending, cancelled: true, cancellationType: 'rejected' }

const leader = { slackId: 'U0LEADER' }
const stranger = { slackId: 'U0STRANGER' }
const REVIEWER = { canReview: true }

describe('statusOf', () => {
  it('reads an unapproved event as pending', () => {
    expect(statusOf(pending)).toBe('pending')
  })

  it('reads an approved event as approved', () => {
    expect(statusOf(approved)).toBe('approved')
  })

  it('lets cancelled win over approved', () => {
    expect(statusOf(cancelled)).toBe('cancelled')
  })

  it('distinguishes a rejection from a cancellation', () => {
    expect(statusOf(rejected)).toBe('rejected')
  })

  it('treats a cancelled event with no type as cancelled', () => {
    expect(statusOf({ ...approved, cancelled: true })).toBe('cancelled')
  })
})

describe('canEdit', () => {
  it('lets the leader edit their own event', () => {
    expect(canEdit(leader, pending, {})).toBe(true)
  })

  it('lets a reviewer edit anyone’s event', () => {
    expect(canEdit(stranger, pending, REVIEWER)).toBe(true)
  })

  it('refuses a stranger', () => {
    expect(canEdit(stranger, pending, {})).toBe(false)
  })

  it('refuses when signed out', () => {
    expect(canEdit(null, pending, REVIEWER)).toBe(false)
  })

  it('refuses once an event is cancelled, even for a reviewer', () => {
    expect(canEdit(leader, cancelled, REVIEWER)).toBe(false)
  })
})

describe('canCancel', () => {
  it('is reviewers only', () => {
    expect(canCancel(leader, approved, {})).toBe(false)
    expect(canCancel(leader, approved, REVIEWER)).toBe(true)
  })

  it('refuses an already cancelled event', () => {
    expect(canCancel(leader, cancelled, REVIEWER)).toBe(false)
  })
})

describe('sortForReview', () => {
  it('puts the soonest event first', () => {
    const sorted = sortForReview([
      { id: 'later', startTime: '2026-12-01T10:00:00Z' },
      { id: 'sooner', startTime: '2026-10-01T10:00:00Z' }
    ])
    expect(sorted.map(e => e.id)).toEqual(['sooner', 'later'])
  })

  it('does not mutate its input', () => {
    const input = [
      { id: 'b', startTime: '2026-12-01T10:00:00Z' },
      { id: 'a', startTime: '2026-10-01T10:00:00Z' }
    ]
    sortForReview(input)
    expect(input.map(e => e.id)).toEqual(['b', 'a'])
  })
})

describe('isUnestablished', () => {
  const known = [
    { name: 'workshop', count: 40, approvedCount: 40, curated: true },
    { name: 'stardance', count: 0, approvedCount: 0, curated: true },
    { name: 'movie-night', count: 1, approvedCount: 1, curated: false },
    { name: 'pending-only', count: 1, approvedCount: 0, curated: false }
  ]

  it('never flags a curated tag, even an unused one', () => {
    expect(isUnestablished('workshop', known)).toBe(false)
    expect(isUnestablished('stardance', known)).toBe(false)
  })

  it('stops flagging once one approved event uses the tag', () => {
    expect(isUnestablished('movie-night', known)).toBe(false)
  })

  it('keeps flagging while the only event using it is unapproved', () => {
    expect(isUnestablished('pending-only', known)).toBe(true)
  })

  it('flags a tag nobody has used', () => {
    expect(isUnestablished('brand-new', known)).toBe(true)
  })
})
