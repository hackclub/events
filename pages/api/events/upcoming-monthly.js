import { getEvents } from '../../../lib/data'
import { byMonth, upcoming, withTags } from '../../../lib/calendar'

export const getUpcomingMonthly = async tags =>
  byMonth(withTags(upcoming(await getEvents()), tags))

export default (req, res) =>
  getUpcomingMonthly(req.query.tags).then(months => res.json(months))
