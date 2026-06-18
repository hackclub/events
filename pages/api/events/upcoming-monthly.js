import { getEvents } from '../../../lib/data'

import { filter, groupBy } from 'lodash'

export const getUpcomingMonthly = async tags => {
  let events = await getEvents()
  // Filter out events from previous months
  events = filter(
    events,
    e =>
      new Date(
        new Date((e.end || '').substring(0, 7)).toISOString().substring(0, 7)
      ) >= new Date(new Date().toISOString().substring(0, 7))
  )
  if (tags) {
    const tagList = tags.split(',')
    events = filter(events, e => tagList.some(t => e.tags?.includes(t)))
  }
  return groupBy(events, e => e.start?.substring(0, 7))
}

export default (req, res) =>
  getUpcomingMonthly(req.query.tags).then(m => res.json(m))
