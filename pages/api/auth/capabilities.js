import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'
import { isabelle } from '../../../lib/isabelle'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(200).json({ canReview: false, canSubmit: false })
  }

  const query = new URLSearchParams({
    actor_slack_id: session.slackId,
    ...(session.email ? { email: session.email } : {})
  })

  const response = await isabelle(`/internal/permissions?${query}`).catch(
    () => null
  )

  if (!response || !response.ok) {
    return res
      .status(503)
      .json({ error: 'could not check your permissions', unavailable: true })
  }

  const body = await response.json().catch(() => null)

  if (!body || typeof body.reviewer !== 'boolean') {
    return res
      .status(503)
      .json({ error: 'could not check your permissions', unavailable: true })
  }

  return res.status(200).json({
    canReview: body.reviewer,
    canSubmit: Boolean(body.submitter)
  })
}
