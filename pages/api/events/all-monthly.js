import { getEvents } from '../../../lib/data'
import { byMonth, withTags } from '../../../lib/calendar'

export default async (req, res) =>
  res.json(byMonth(withTags(await getEvents(), req.query.tags)))
