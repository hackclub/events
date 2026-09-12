import { getEvents } from '../../../lib/data'
import { withTags } from '../../../lib/calendar'

export default async (req, res) =>
  res.json(withTags(await getEvents(), req.query.tags))
