export const DOMAIN = 'events.hackclub.com'
export const PRODID = '-//Hack Club//Events//EN'

const pad = value => String(value).padStart(2, '0')

export const stamp = value => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
      date.getUTCSeconds()
    )}Z`
  )
}

export const escape = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

export const fold = line => {
  const bytes = [...line]
  if (bytes.length <= 75) return line

  const out = [bytes.slice(0, 75).join('')]
  for (let i = 75; i < bytes.length; i += 74) {
    out.push(` ${bytes.slice(i, i + 74).join('')}`)
  }

  return out.join('\r\n')
}

export const uidFor = event =>
  `${event.seriesId || event.id}@${DOMAIN}`

const line = (name, value) => `${name}:${escape(value)}`

const vevent = (event, { now, recurrenceId, rrule, exdates = [] } = {}) => {
  const start = stamp(event.start)
  const end = stamp(event.end)
  if (!start || !end) return []

  const out = [
    'BEGIN:VEVENT',
    line('UID', recurrenceId ? `${uidFor(event)}-${recurrenceId}` : uidFor(event)),
    `DTSTAMP:${stamp(now || new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    line('SUMMARY', event.title)
  ]

  if (rrule) out.push(`RRULE:${rrule}`)

  for (const date of exdates) {
    const value = stamp(date)
    if (value) out.push(`EXDATE:${value}`)
  }

  if (recurrenceId) out.push(`RECURRENCE-ID:${recurrenceId}`)

  if (event.desc) out.push(line('DESCRIPTION', event.desc))
  if (event.location) out.push(line('LOCATION', event.location))
  if (event.slug) out.push(line('URL', `https://${DOMAIN}/${event.slug}`))
  if (event.cancelled) out.push('STATUS:CANCELLED')

  out.push('END:VEVENT')
  return out
}

export const seriesBlocks = (occurrences, { now } = {}) => {
  const live = occurrences.filter(o => !o.cancelled)
  const anchor = live.find(o => o.seriesRule) || live[0]
  if (!anchor) return []

  const skipped = occurrences
    .filter(o => o.cancelled && o.occurrenceStart)
    .map(o => o.occurrenceStart)

  const moved = live.filter(
    o =>
      o !== anchor &&
      o.occurrenceStart &&
      stamp(o.occurrenceStart) !== stamp(o.start)
  )

  const blocks = vevent(anchor, {
    now,
    rrule: anchor.seriesRule,
    exdates: [...skipped, ...moved.map(o => o.occurrenceStart)]
  })

  for (const occurrence of moved) {
    blocks.push(
      ...vevent(occurrence, { now, recurrenceId: stamp(occurrence.occurrenceStart) })
    )
  }

  return blocks
}

export const buildCalendar = (events, { now } = {}) => {
  const series = new Map()
  const singles = []

  for (const event of events || []) {
    if (event.seriesId && event.seriesRule !== undefined) {
      const group = series.get(event.seriesId) || []
      group.push(event)
      series.set(event.seriesId, group)
    } else {
      singles.push(event)
    }
  }

  const body = []
  for (const event of singles) body.push(...vevent(event, { now }))
  for (const group of series.values()) body.push(...seriesBlocks(group, { now }))

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${PRODID}`, 'CALSCALE:GREGORIAN']
    .concat(body)
    .concat('END:VCALENDAR')
    .map(fold)
    .join('\r\n')
}
