import { getEvents } from '../../../lib/data'
import { groupBy } from 'lodash'

export default async (req, res) => {
  const events = await getEvents()
  const months = groupBy(events, e => e.start.substring(0, 7))
  res.json(months)
}
