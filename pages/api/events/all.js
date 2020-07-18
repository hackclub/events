const { getEvents } = require('../../../lib/data')

export default async (req, res) => {
  const events = await getEvents()
  res.json(events)
}
