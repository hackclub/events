const { getEvents } = require('../../../lib/data')
const { groupBy } = require('lodash')

export default async (req, res) => {
  const events = await getEvents()
  const months = groupBy(events, (e) => e.start.substring(0, 7))
  res.json(months)
}
