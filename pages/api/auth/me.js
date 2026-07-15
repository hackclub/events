import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)
  return res.status(200).json({
    slackId: session.slackId || null,
    sub: session.sub || null,
    name: session.name || null,
    email: session.email || null,
  }) 
}
