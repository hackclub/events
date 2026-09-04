import { filter, groupBy, orderBy } from 'lodash'
import { now } from './now'

// How long an event stays listed as upcoming after it ends, so it does not
// disappear from under someone who is reading the page as it finishes.
export const GRACE_MS = 2 * 60 * 60 * 1000

// new Date(null) is the epoch, not an invalid date, so null has to be
// rejected explicitly or an undated event silently becomes a 1970 one.
const ms = value => (value == null ? NaN : new Date(value).getTime())

export const hasDates = event =>
  !Number.isNaN(ms(event?.start)) && !Number.isNaN(ms(event?.end))

export const isHappeningNow = (event, at = now()) => {
  const t = at.getTime()
  return hasDates(event) && ms(event.start) <= t && t < ms(event.end)
}

export const isUpcoming = (event, at = now()) =>
  hasDates(event) && ms(event.end) > at.getTime() - GRACE_MS

export const isPast = (event, at = now()) =>
  hasDates(event) && !isUpcoming(event, at)

export const upcoming = (events, at = now()) =>
  orderBy(filter(events, e => isUpcoming(e, at)), 'start')

export const past = (events, at = now()) =>
  orderBy(filter(events, e => isPast(e, at)), 'start')

export const byMonth = events => groupBy(events, e => e.start.substring(0, 7))

export const withTags = (events, tags) => {
  if (!tags) return events
  const wanted = tags.split(',').filter(Boolean)
  if (wanted.length === 0) return events
  return filter(events, e => wanted.some(t => e.tags?.includes(t)))
}
