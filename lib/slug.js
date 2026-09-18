import GHSlugger from 'github-slugger'

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec'
]

export const baseSlug = title => new GHSlugger().slug(String(title || ''))

export const dateSuffix = start => {
  const date = new Date(start)
  if (Number.isNaN(date.getTime())) return null

  return `${MONTHS[date.getUTCMonth()]}-${date.getUTCDate()}-${date.getUTCFullYear()}`
}

export const slugFor = event => {
  const base = baseSlug(event?.title)
  if (!event?.seriesId) return base

  const suffix = dateSuffix(event.start ?? event.startTime)
  return suffix ? `${base}-${suffix}` : base
}

const tally = values => {
  const counts = new Map()
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1)
  return counts
}

export const assignSlugs = events => {
  const list = events || []

  const bases = list.map(event => baseSlug(event.title))
  const baseCounts = tally(bases)

  const candidates = list.map((event, index) => {
    const base = bases[index]
    if (!event.seriesId && baseCounts.get(base) === 1) return base

    const suffix = dateSuffix(event.start)
    return suffix ? `${base}-${suffix}` : base
  })

  const candidateCounts = tally(candidates)

  return list.map((event, index) => {
    const candidate = candidates[index]
    const slug =
      candidateCounts.get(candidate) === 1
        ? candidate
        : `${candidate}-${String(event.id || '').slice(0, 4)}`

    return { ...event, slug }
  })
}
