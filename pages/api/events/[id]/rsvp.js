import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../../lib/session'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const { id } = req.query
  const { attending } = req.body

  if (typeof attending !== 'boolean') {
    return res.status(422).json({ error: 'attending must be a boolean' })
  }

  const isabelleRes = await fetch(
    `${process.env.ISABELLE_BASE_URL}/internal/events/${id}/rsvp`,
    {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-internal-secret': process.env.ISABELLE_RSVP_SECRET,
      },
      body: JSON.stringify({
        slack_id: session.slackId,
        attending,
      }),
    }
  )

  if (!isabelleRes.ok) {
    const err = await isabelleRes.json().catch(() => ())
    return res.status(isabelleRes.status).json({ error: err.error } || 'isabelle error')
  }

  const data = await isabelleRes.json()
  return res.status(200).json(data)
}
