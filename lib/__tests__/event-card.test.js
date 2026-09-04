import { describe, expect, it } from 'vitest'
import { toCard } from '../event-card'

const full = {
  id: 'abc',
  slug: 'code-in-the-dark',
  title: 'Code in the Dark',
  desc: 'A very long description '.repeat(50),
  leader: 'amogh',
  cal: 'https://www.google.com/calendar/render?action=TEMPLATE&details=...',
  start: '2026-09-01T17:00:00Z',
  end: '2026-09-01T19:00:00Z',
  youtube: 'https://youtu.be/abc',
  ama: false,
  amaAvatar: '',
  avatar: 'https://cachet.hackclub.com/users/U123/r',
  approved: true,
  tags: ['workshop'],
  interestCount: 12,
  leaderSlackId: 'U123',
  rsvpFormUrl: null
}

describe('toCard', () => {
  it('keeps every field the event card renders', () => {
    expect(toCard(full)).toEqual({
      id: 'abc',
      slug: 'code-in-the-dark',
      title: 'Code in the Dark',
      leader: 'amogh',
      avatar: 'https://cachet.hackclub.com/users/U123/r',
      start: '2026-09-01T17:00:00Z',
      end: '2026-09-01T19:00:00Z',
      tags: ['workshop']
    })
  })

  it('drops the two largest unused fields', () => {
    const card = toCard(full)
    expect(card).not.toHaveProperty('desc')
    expect(card).not.toHaveProperty('cal')
  })

  it('never yields undefined, which getStaticProps cannot serialise', () => {
    const card = toCard({ id: 'x', slug: 'x', start: 'a', end: 'b' })
    expect(Object.values(card).every(v => v !== undefined)).toBe(true)
    expect(card.tags).toEqual([])
  })
})
