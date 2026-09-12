// Kept in sync with env.event_tags in Isabelle.
export const EVENT_TAGS = ['stardance', 'ama', 'workshop', 'social']

export const MAX_TITLE = 120
export const MAX_DESCRIPTION = 4000
export const MAX_DURATION_MS = 24 * 60 * 60 * 1000
export const MAX_TAGS = 6
export const MAX_TAG_LENGTH = 24

export const normaliseTag = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_TAG_LENGTH)

export const isNewTag = tag => Boolean(tag) && !EVENT_TAGS.includes(tag)

const isHttpsUrl = value => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const trimmed = value => (typeof value === 'string' ? value.trim() : '')

// Returns { errors } keyed by field, and the normalised values to send on.
export const validateSubmission = (
  input = {},
  at = new Date(),
  { requireFutureStart = true } = {}
) => {
  const errors = {}

  const title = trimmed(input.title)
  if (!title) errors.title = 'Give your event a title.'
  else if (title.length > MAX_TITLE)
    errors.title = `Keep the title under ${MAX_TITLE} characters.`

  const description = trimmed(input.description)
  if (!description) errors.description = 'Describe what the event is.'
  else if (description.length > MAX_DESCRIPTION)
    errors.description = `Keep the description under ${MAX_DESCRIPTION} characters.`

  const start = new Date(trimmed(input.start))
  const end = new Date(trimmed(input.end))

  if (Number.isNaN(start.getTime())) errors.start = 'Pick a start time.'
  else if (requireFutureStart && start <= at)
    errors.start = 'Start time has to be in the future.'

  if (Number.isNaN(end.getTime())) errors.end = 'Pick an end time.'
  else if (!Number.isNaN(start.getTime())) {
    if (end <= start) errors.end = 'End time has to be after the start time.'
    else if (end - start > MAX_DURATION_MS)
      errors.end = 'Events cannot run longer than 24 hours.'
  }

  const eventLink = trimmed(input.eventLink)
  if (eventLink && !isHttpsUrl(eventLink))
    errors.eventLink = 'Location has to be a full https:// link.'

  const rsvpFormUrl = trimmed(input.rsvpFormUrl)
  if (rsvpFormUrl && !isHttpsUrl(rsvpFormUrl))
    errors.rsvpFormUrl = 'RSVP link has to be a full https:// link.'

  const tags = Array.isArray(input.tags)
    ? input.tags
        .map(normaliseTag)
        .filter((tag, index, all) => tag && all.indexOf(tag) === index)
        .slice(0, MAX_TAGS)
    : []

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    values: {
      title,
      description,
      start: Number.isNaN(start.getTime()) ? null : start.toISOString(),
      end: Number.isNaN(end.getTime()) ? null : end.toISOString(),
      eventLink: eventLink || null,
      rsvpFormUrl: rsvpFormUrl || null,
      tags
    }
  }
}
