import { filter } from 'lodash'
import { getEvents } from '../../../lib/data'

export default async (req, res) => {
  let events = await getEvents()
  if (req.query.tags) {
    const tags = req.query.tags.split(',')
    events = filter(events, e => tags.some(t => e.tags?.includes(t)))
  }
  res.json(events)
}
