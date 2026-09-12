import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../lib/session'
import { validateSubmission } from '../../../lib/event-submission'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const session = await getIronSession(req, res, sessionOptions)

  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const { errors, valid, values } = validateSubmission(req.body)

  if (!valid) {
    return res.status(422).json({ error: 'invalid submission', errors })
  }

  const isabelleRes = await fetch(
    `${process.env.ISABELLE_BASE_URL}/internal/events`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-secret': process.env.ISABELLE_RSVP_SECRET
      },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        start_time: values.start,
        end_time: values.end,
        event_link: values.eventLink,
        rsvp_form_url: values.rsvpFormUrl,
        tags: values.tags,
        // Never taken from the request: the submitter is whoever is logged in,
        // and approval is Isabelle's decision, not the client's.
        leader_slack_id: session.slackId,
        submitted_by: {
          sub: session.sub,
          slackId: session.slackId,
          name: session.name,
          email: session.email
        }
      })
    }
  )

  if (!isabelleRes.ok) {
    const body = await isabelleRes.json().catch(() => ({}))
    return res
      .status(isabelleRes.status)
      .json({ error: body.error || 'could not create event' })
  }

  return res.status(201).json(await isabelleRes.json())
}
