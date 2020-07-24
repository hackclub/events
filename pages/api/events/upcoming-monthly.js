const { getEvents } = require('../../../lib/data')
const { groupBy, filter } = require('lodash')

export const getUpcomingMonthly = async () => {
  let events = await getEvents()
  // Filter out events from previous months
  events = filter(
    events,
    e =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) >=
      new Date(new Date().toISOString().substring(0, 7))
  )
  return groupBy(events, e => e.start?.substring(0, 7))
}

export default (req, res) => getUpcomingMonthly().then(m => res.json(m))
