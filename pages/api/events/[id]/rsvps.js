import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../../lib/session'
import { getEvents } from '../../../../lib/data'
import { find } from 'lodash'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const { id } = req.query

  const events = await getEvents()
  const event = find(events, { id })

  if (!event) {
    return res.status(404).json({ error: 'event not found' })
  }

  const isCreator = session.slackId === event.leaderSlackId

  const isabelleRes = await fetch(
    `${process.env.ISABELLE_BASE_URL}/internal/events/${id}/rsvps`,
    {
      headers: {
        'x-internal-secret': process.env.ISABELLE_RSVP_SECRET,
      },
    }
  )

  if (!isabelleRes.ok) {
    return res.status(isabelleRes.status).json({ error: 'isabelle error' })
  }

  const data = await isabelleRes.json()
  const attending = (data.attendees || []).some(a => a.slackId === session.slackId || (session.sub && a.sub === session.sub))

  if (isCreator) {
    return res.status(200).json({
      attendees: data.attendees || [],
      InterestCount: data.InterestCount || 0,
      attending,
    })
  }

  return res.status(200).json({
    interestCount: data.InterestCount || 0,
    attending,
  })
}
