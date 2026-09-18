import { isabelle } from './isabelle'
import {
  slackIdsIn,
  slackMarkupToMarkdown,
  slackMarkupToPlain
} from './slack-markup'
import { channelIdOf, channelIdsIn } from './venue'

export const resolveSlackNames = async ids => {
  if (!ids.length) return {}

  try {
    const response = await isabelle(
      `/internal/slack-names?ids=${encodeURIComponent(ids.join(','))}`
    )
    if (!response.ok) return {}

    const body = await response.json()
    return body.names || {}
  } catch {
    return {}
  }
}

const descriptionOf = event => event.desc ?? event.description ?? ''

export const withChannelNames = async events => {
  const list = events || []

  const ids = Array.from(
    new Set([
      ...channelIdsIn(list.map(event => event.eventLink)),
      ...list.flatMap(event => slackIdsIn(descriptionOf(event)))
    ])
  )

  const names = await resolveSlackNames(ids)
  const channelName = id => (names[id]?.kind === 'channel' ? names[id].name : null)

  return list.map(event => ({
    ...event,
    ...('desc' in event
      ? { desc: slackMarkupToMarkdown(event.desc, names) }
      : {}),
    ...('description' in event
      ? { description: slackMarkupToPlain(event.description, names) }
      : {}),
    eventLinkChannel: channelName(channelIdOf(event.eventLink))
  }))
}

export const passThroughWithChannels = async (res, response) => {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) return res.status(response.status).json(body)

  if (Array.isArray(body.events)) {
    return res
      .status(response.status)
      .json({ ...body, events: await withChannelNames(body.events) })
  }

  if (body.event) {
    const [event] = await withChannelNames([body.event])
    return res.status(response.status).json({ ...body, event })
  }

  return res.status(response.status).json(body)
}
