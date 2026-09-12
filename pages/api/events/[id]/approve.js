import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../../lib/session'
import { isabelle, passThrough } from '../../../../lib/isabelle'
import { clearEventsCache } from '../../../../lib/data'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const response = await isabelle(
    `/internal/events/${encodeURIComponent(req.query.id)}/approve`,
    { method: 'POST', body: { actor_slack_id: session.slackId } }
  )

  if (response.ok) clearEventsCache()

  return passThrough(res, response)
}
