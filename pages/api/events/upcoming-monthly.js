const { getEvents } = require('../../../lib/data')
const { groupBy, filter } = require('lodash')

export default async (req, res) => {
  let events = await getEvents()
  // Filter out events from previous months
  events = filter(
    events,
    (e) =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) >=
      new Date(new Date().toISOString().substring(0, 7))
  )
  const months = groupBy(events, (e) => e.start.substring(0, 7))
  res.json(months)
}
