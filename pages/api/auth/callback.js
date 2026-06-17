import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)

  const { code, state } = req.query

  if (!state || state !== session.oauthState) {
    return res.status(400).json({ error: 'invalid state' })
  }
  
  const params = [
    `client_id=${encodeURIComponent(process.env.AUTH_CLIENT_ID)}`,
    `client_secret=${encodeURIComponent(process.env.AUTH_CLIENT_SECRET)}`,
    `redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`)}`,
    `code=${encodeURIComponent(code)}`,
    `grant_type=authorization_code`,
  ].join('&')

  const tokenRes = await fetch('https://auth.hackclub.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!tokenRes.ok) {
    // return res.status(500).json({ error: 'token exchange failed' })
  
    const errorBody = await tokenRes.json().catch(() => ({ raw: 'failed' }))
    
    console.log('Token Exchange Failed:', tokenRes.status, errorBody)
    return res.status(500).json({
      error: 'failed',
      status: tokenRes.status,
      detail: errorBody
    })
  }

  const tokens = await tokenRes.json()

  const idTokenPayload = JSON.parse(
    Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString('utf8')
  )

  const slackId = idTokenPayload.slack_id
  const sub = idTokenPayload.sub || null
  const name = idTokenPayload.name || null
  const email = idTokenPayload.email || null

  if (!slackId && !sub) {
    return res.status(400).json({ error: 'no identity in token' })
  }

  const returnTo = session.returnTo || '/'
  session.slackId = slackId
  session.sub = sub
  session.name = name
  session.email = email
  session.oauthState = null
  session.returnTo = null
  await session.save()
  res.redirect(returnTo)
}
