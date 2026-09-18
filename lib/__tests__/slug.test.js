import { describe, expect, it } from 'vitest'
import { assignSlugs, baseSlug, dateSuffix, slugFor } from '../slug'

const mk = (id, title, start, seriesId = null) => ({ id, title, start, seriesId })

const slugs = events => assignSlugs(events).map(e => e.slug)

describe('baseSlug', () => {
  it('does not number repeats', () => {
    expect(baseSlug('Website Circle')).toBe('website-circle')
    expect(baseSlug('Website Circle')).toBe('website-circle')
  })

  it('copes with nothing', () => {
    expect(baseSlug(null)).toBe('')
  })
})

describe('dateSuffix', () => {
  it('reads as a date', () => {
    expect(dateSuffix('2026-10-01T19:00:00Z')).toBe('oct-1-2026')
  })

  it('is nothing for a date it cannot read', () => {
    expect(dateSuffix('not a date')).toBeNull()
  })
})

describe('assignSlugs', () => {
  it('leaves a one-off event with a clean slug', () => {
    expect(slugs([mk('a', 'Code in the Dark', '2026-10-01T19:00:00Z')])).toEqual([
      'code-in-the-dark'
    ])
  })

  it('dates every occurrence of a series', () => {
    const series = [
      mk('a', 'Website Circle', '2026-09-24T19:00:00Z', 'S'),
      mk('b', 'Website Circle', '2026-10-01T19:00:00Z', 'S'),
      mk('c', 'Website Circle', '2026-10-08T19:00:00Z', 'S')
    ]
    expect(slugs(series)).toEqual([
      'website-circle-sep-24-2026',
      'website-circle-oct-1-2026',
      'website-circle-oct-8-2026'
    ])
  })

  it('dates events that merely share a title', () => {
    expect(
      slugs([
        mk('a', 'Gartic Phone', '2026-10-01T19:00:00Z'),
        mk('b', 'Gartic Phone', '2026-11-05T19:00:00Z')
      ])
    ).toEqual(['gartic-phone-oct-1-2026', 'gartic-phone-nov-5-2026'])
  })

  it('gives the same event the same slug whatever order it arrives in', () => {
    const a = mk('a', 'Website Circle', '2026-09-24T19:00:00Z', 'S')
    const b = mk('b', 'Website Circle', '2026-10-01T19:00:00Z', 'S')
    const c = mk('c', 'One Off', '2026-10-02T19:00:00Z')

    const forwards = assignSlugs([a, b, c])
    const backwards = assignSlugs([c, b, a])

    const find = (list, id) => list.find(e => e.id === id).slug
    for (const id of ['a', 'b', 'c']) {
      expect(find(forwards, id)).toBe(find(backwards, id))
    }
  })

  it('does not change a lone event when an unrelated one is added', () => {
    const lone = mk('a', 'Code in the Dark', '2026-10-01T19:00:00Z')
    const other = mk('b', 'Something Else', '2026-10-02T19:00:00Z')

    expect(assignSlugs([lone])[0].slug).toBe(
      assignSlugs([lone, other])[0].slug
    )
  })

  it('separates two events with the same title on the same day', () => {
    const result = slugs([
      mk('abcd1234', 'Standup', '2026-10-01T09:00:00Z'),
      mk('efgh5678', 'Standup', '2026-10-01T17:00:00Z')
    ])
    expect(new Set(result).size).toBe(2)
    expect(result[0]).toBe('standup-oct-1-2026-abcd')
  })

  it('never hands out the same slug twice', () => {
    const events = [
      mk('a', 'Website Circle', '2026-09-24T19:00:00Z', 'S'),
      mk('b', 'Website Circle', '2026-10-01T19:00:00Z', 'S'),
      mk('c', 'Website Circle', '2026-10-01T19:00:00Z'),
      mk('d', 'Other', '2026-10-01T19:00:00Z')
    ]
    const result = slugs(events)
    expect(new Set(result).size).toBe(result.length)
  })

  it('copes with nothing', () => {
    expect(assignSlugs([])).toEqual([])
    expect(assignSlugs(null)).toEqual([])
  })
})

describe('slugFor', () => {
  it('matches what assignSlugs gives a series occurrence', () => {
    const series = [
      mk('a', 'Website Circle', '2026-09-24T19:00:00Z', 'S'),
      mk('b', 'Website Circle', '2026-10-01T19:00:00Z', 'S')
    ]
    const assigned = assignSlugs(series)
    series.forEach((event, i) => {
      expect(slugFor(event)).toBe(assigned[i].slug)
    })
  })

  it('reads the manage shape too, where the field is startTime', () => {
    expect(
      slugFor({ title: 'Website Circle', startTime: '2026-10-01T19:00:00Z', seriesId: 'S' })
    ).toBe('website-circle-oct-1-2026')
  })

  it('leaves a one-off alone', () => {
    expect(slugFor({ title: 'Code in the Dark', start: '2026-10-01T19:00:00Z' })).toBe(
      'code-in-the-dark'
    )
  })

  it('copes with nothing', () => {
    expect(slugFor(null)).toBe('')
  })
})
