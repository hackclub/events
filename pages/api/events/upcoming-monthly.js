import { getEvents } from '../../../lib/data'
import { byMonth, nextDateOnly, upcoming, withTags } from '../../../lib/calendar'

export const getUpcomingMonthly = async tags =>
  byMonth(withTags(upcoming(nextDateOnly(await getEvents())), tags))

export default (req, res) =>
  getUpcomingMonthly(req.query.tags).then(months => res.json(months))
