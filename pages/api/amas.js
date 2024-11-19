import { getEvents } from '../../lib/data'
import { filter } from 'lodash'

export default async (req, res) => {
  let events = await getEvents()
  events = filter(events, { ama: true })
  res.json(events)
}
