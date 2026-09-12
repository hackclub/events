import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'
import { isabelle, passThrough } from '../../../lib/isabelle'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)
  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const response = await isabelle(
    `/internal/events/manage?scope=mine&actor_slack_id=${encodeURIComponent(
      session.slackId
    )}`
  )
  return passThrough(res, response)
}
