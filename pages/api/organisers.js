import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../lib/session'
import { isabelle, passThrough } from '../../lib/isabelle'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const actor = encodeURIComponent(session.slackId)

  if (req.method === 'GET') {
    return passThrough(
      res,
      await isabelle(`/internal/submitters?actor_slack_id=${actor}`)
    )
  }

  if (req.method === 'POST') {
    return passThrough(
      res,
      await isabelle('/internal/submitters', {
        method: 'POST',
        body: {
          actor_slack_id: session.slackId,
          slack_id: req.body?.slackId,
          name: req.body?.name,
          note: req.body?.note
        }
      })
    )
  }

  if (req.method === 'DELETE') {
    const target = encodeURIComponent(req.query.slackId || '')
    return passThrough(
      res,
      await isabelle(`/internal/submitters/${target}?actor_slack_id=${actor}`, {
        method: 'DELETE'
      })
    )
  }

  return res.status(405).json({ error: 'method not allowed' })
}
