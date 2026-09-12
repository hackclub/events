import { getIronSession } from 'iron-session'
import { sessionOptions } from '../../../../lib/session'
import { isabelle, passThrough } from '../../../../lib/isabelle'
import { clearEventsCache } from '../../../../lib/data'
import { validateSubmission } from '../../../../lib/event-submission'

export default async function handler(req, res) {
  const session = await getIronSession(req, res, sessionOptions)
  if (!session.slackId) {
    return res.status(401).json({ error: 'not logged in' })
  }

  const id = encodeURIComponent(req.query.id)
  const actor = encodeURIComponent(session.slackId)

  if (req.method === 'GET') {
    const response = await isabelle(
      `/internal/events/${id}/manage?actor_slack_id=${actor}`
    )
    return passThrough(res, response)
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const { errors, valid, values } = validateSubmission(req.body, new Date(), {
    requireFutureStart: false
  })

  if (!valid) {
    return res.status(422).json({ error: 'invalid submission', errors })
  }

  const response = await isabelle(`/internal/events/${id}`, {
    method: 'PATCH',
    body: {
      actor_slack_id: session.slackId,
      title: values.title,
      description: values.description,
      start_time: values.start,
      end_time: values.end,
      event_link: values.eventLink,
      rsvp_form_url: values.rsvpFormUrl,
      tags: values.tags
    }
  })

  if (response.ok) clearEventsCache()

  return passThrough(res, response)
}
