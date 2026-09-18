import tt from 'tinytime'

const short = tt('{Mo} {DD}')

export const groupSeries = events => {
  const groups = []
  const bySeries = new Map()

  for (const event of events || []) {
    if (!event.seriesId) {
      groups.push({ key: event.id, lead: event, events: [event], count: 1 })
      continue
    }

    const existing = bySeries.get(event.seriesId)
    if (existing) {
      existing.events.push(event)
      existing.count += 1
      continue
    }

    const group = {
      key: event.seriesId,
      seriesId: event.seriesId,
      lead: event,
      events: [event],
      count: 1
    }
    bySeries.set(event.seriesId, group)
    groups.push(group)
  }

  return groups
}

export const describeSeries = group => {
  if (!group || group.count < 2) return null

  const starts = group.events
    .map(event => event.startTime)
    .filter(Boolean)
    .map(iso => new Date(iso))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)

  if (starts.length < 2) return `${group.count} dates`

  return `${group.count} dates · ${short.render(starts[0])} – ${short.render(
    starts[starts.length - 1]
  )}`
}
