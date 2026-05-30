import { filter } from 'lodash'
import { getEvents } from '../../../lib/data'
import { groupBy } from 'lodash'

export default async (req, res) => {
  let events = await getEvents()
  if (req.query.tags) {
    const tags = req.query.tags.split(',')
    events = filter(events, e => tags.some(t => e.tags?.includes(t)))
  }
  const months = groupBy(events, e => e.start.substring(0, 7))
  res.json(months)
}
