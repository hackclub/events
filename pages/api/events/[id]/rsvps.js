import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../../lib/session'
import { isabelle } from '../../../../lib/isabelle'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const id = encodeURIComponent(req.query.id)
  const actor = encodeURIComponent(session.slackId)

  const [manage, rsvps] = await Promise.all([
    isabelle(`/internal/events/${id}/manage?actor_slack_id=${actor}`),
    isabelle(`/internal/events/${id}/rsvps`)
  ])

  if (rsvps.status === 404) {
    return res.status(404).json({ error: 'event not found' })
  }

  if (!rsvps.ok) {
    return res.status(rsvps.status).json({ error: 'could not load rsvps' })
  }

  const data = await rsvps.json()
  const attendees = data.attendees || []
  const attending = attendees.some(
    a => a.slackId === session.slackId || (session.sub && a.sub === session.sub)
  )

  if (manage.ok) {
    return res.status(200).json({
      attendees,
      InterestCount: data.InterestCount || 0,
      attending
    })
  }

  return res.status(200).json({
    interestCount: data.InterestCount || 0,
    attending
  })
}
