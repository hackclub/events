export const EMPTY_EVENT_FORM = {
  title: '',
  description: '',
  start: '',
  end: '',
  eventLink: '',
  rsvpFormUrl: '',
  tags: []
}

const pad = value => String(value).padStart(2, '0')

export const toISO = value => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

export const toLocalInput = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

export const formFromEvent = event => ({
  title: event?.title ?? '',
  description: event?.description ?? '',
  start: toLocalInput(event?.startTime),
  end: toLocalInput(event?.endTime),
  eventLink: event?.eventLink ?? '',
  rsvpFormUrl: event?.rsvpFormUrl ?? '',
  tags: event?.tags ?? []
})

export const payloadFromForm = form => ({
  title: form.title,
  description: form.description,
  start: toISO(form.start),
  end: toISO(form.end),
  eventLink: form.eventLink,
  rsvpFormUrl: form.rsvpFormUrl,
  tags: form.tags
})
