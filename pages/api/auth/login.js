import crypto from 'crypto'
import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)

  const returnTo = req.query.returnTo || '/'

  const state = crypto.randomBytes(16).toString('hex')
  session.oauthState = state
  session.returnTo = returnTo
  await session.save()

  const params = new URLSearchParams({
    client_id: process.env.AUTH_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid slack_id',
    state,
  })

  res.redirect(`https://auth.hackclub.com/oauth/authorize?${params}`)
}
