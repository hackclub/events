import { getPublicEvents } from '../../lib/data'
import { buildCalendar } from '../../lib/ics'
import { upcoming, withTags } from '../../lib/calendar'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  try {
    const all = await getPublicEvents()
    const events = withTags(upcoming(all), req.query.tags)

    res.setHeader('content-type', 'text/calendar; charset=utf-8')
    res.setHeader('cache-control', 'public, max-age=300')
    res.setHeader('content-disposition', 'inline; filename="hack-club-events.ics"')

    return res.status(200).send(buildCalendar(events))
  } catch (error) {
    return res.status(503).json({ error: 'could not build the calendar' })
  }
}
