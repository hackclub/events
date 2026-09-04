import { getEvents } from '../../../lib/data'
import { upcoming, withTags } from '../../../lib/calendar'

export default async (req, res) =>
  res.json(withTags(upcoming(await getEvents()), req.query.tags))
