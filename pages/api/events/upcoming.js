import { filter } from 'lodash'
import { getEvents } from '../../../lib/data'

export default async (req, res) => {
  let events = await getEvents()
  // Filter out events from previous months
  events = filter(
    events,
    e =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) >=
      new Date(new Date().toISOString().substring(0, 7))
  )
  res.json(events)
}
