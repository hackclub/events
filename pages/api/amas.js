const { getEvents } = require('../../../lib/data')
const { filter } = require('lodash')

export default async (req, res) => {
  let events = await getEvents()
  events = filter(events, { ama: true })
  res.json(events)
}
