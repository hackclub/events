import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)
  if (session.slackId) {
    return res.status(200).json({ slackId: session.slackId })
  }

  return res.status(200).json({ slackId: null })
}
