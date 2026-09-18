export const MAX_COUNT = 260
export const MAX_INTERVAL = 52
export const PREVIEW_LIMIT = 8

export const NONE = 'once'
export const DAILY = 'daily'
export const WEEKLY = 'weekly'
export const MONTHLY = 'monthly'

export const COUNT = 'count'
export const UNTIL = 'until'
export const NEVER = 'never'

export const FREQUENCIES = [
  { value: NONE, label: 'Does not repeat' },
  { value: DAILY, label: 'Every day' },
  { value: WEEKLY, label: 'Every week' },
  { value: MONTHLY, label: 'Every month' }
]

export const WEEKDAYS = [
  { code: 'MO', short: 'M', label: 'Monday' },
  { code: 'TU', short: 'T', label: 'Tuesday' },
  { code: 'WE', short: 'W', label: 'Wednesday' },
  { code: 'TH', short: 'T', label: 'Thursday' },
  { code: 'FR', short: 'F', label: 'Friday' },
  { code: 'SA', short: 'S', label: 'Saturday' },
  { code: 'SU', short: 'S', label: 'Sunday' }
]

const ORDER = WEEKDAYS.map(day => day.code)
const JS_DAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }

const UNITS = {
  [DAILY]: ['Daily', 'Every {n} days'],
  [WEEKLY]: ['Weekly', 'Every {n} weeks'],
  [MONTHLY]: ['Monthly', 'Every {n} months']
}

export const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export const sortDays = days =>
  [...new Set(days || [])]
    .filter(day => ORDER.includes(day))
    .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))

export const ruleFrom = form => {
  const { frequency, interval, byDay, endsType, count, until, timezone } =
    form || {}
  if (!frequency || frequency === NONE) return null

  const every = Number(interval ?? 1)
  const kind = endsType || COUNT

  const ends = { type: kind }
  if (kind === COUNT) ends.count = Number(count)
  if (kind === UNTIL) ends.until = until

  return {
    frequency,
    interval: Number.isInteger(every) ? every : 1,
    byDay: frequency === WEEKLY ? sortDays(byDay) : [],
    ends,
    ...(timezone ? { timezone } : {})
  }
}

export const validateRecurrence = form => {
  const { frequency, interval, endsType, count, until, byDay, start } = form || {}
  if (!frequency || frequency === NONE) return null

  if (!UNITS[frequency]) return 'Pick how often it repeats.'

  const every = Number(interval ?? 1)
  if (!Number.isInteger(every) || every < 1 || every > MAX_INTERVAL) {
    return `Repeat every 1 to ${MAX_INTERVAL}.`
  }

  if (frequency === WEEKLY && (byDay?.length ?? 0) > 7) {
    return 'Pick up to seven days.'
  }

  const kind = endsType || COUNT

  if (kind === COUNT) {
    const dates = Number(count)
    if (!Number.isInteger(dates)) return 'How many dates? Use a whole number.'
    if (dates < 2) return 'A repeating event needs at least 2 dates.'
    if (dates > MAX_COUNT) return `That is more than ${MAX_COUNT} dates.`
  }

  if (kind === UNTIL) {
    if (!until) return 'Pick the date it runs until.'
    const ends = new Date(until)
    if (Number.isNaN(ends.getTime())) return 'That end date cannot be read.'
    if (start && ends <= new Date(start)) {
      return 'It has to end after the first date.'
    }
  }

  return null
}

const addMonths = (date, months) => {
  const day = date.getDate()
  const next = new Date(date)
  next.setDate(1)
  next.setMonth(next.getMonth() + months)

  const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  if (day > daysInMonth) return null

  next.setDate(day)
  return next
}

const startOfWeek = date => {
  const out = new Date(date)
  out.setDate(out.getDate() - ((out.getDay() + 6) % 7))
  return out
}

const weeklyByDay = (first, rule, cap, until) => {
  const out = []
  const anchorWeek = startOfWeek(first)

  for (let week = 0; week < 1040 && out.length < cap; week += 1) {
    const base = new Date(anchorWeek)
    base.setDate(base.getDate() + rule.interval * 7 * week)

    for (const day of rule.byDay) {
      if (out.length >= cap) break

      const date = new Date(base)
      date.setDate(date.getDate() + ((JS_DAY[day] + 6) % 7))
      date.setHours(first.getHours(), first.getMinutes(), 0, 0)

      if (date < first) continue
      if (until && date > until) return out

      out.push(date)
    }
  }

  return out
}

const stepped = (first, cap, until, next) => {
  const out = []

  for (let i = 0; out.length < cap && i < 2000; i += 1) {
    const date = next(i)
    if (!date) continue
    if (until && date > until) break
    out.push(date)
  }

  return out
}

export const occurrences = (start, rule, limit = PREVIEW_LIMIT) => {
  const first = start instanceof Date ? start : new Date(start)
  if (Number.isNaN(first.getTime())) return []
  if (!rule) return [first]

  const ends = rule.ends || {}
  const cap = ends.type === COUNT ? Math.min(Number(ends.count) || 0, limit) : limit
  const until = ends.type === UNTIL && ends.until ? new Date(ends.until) : null

  if (rule.frequency === MONTHLY) {
    return stepped(first, cap, until, i => addMonths(first, rule.interval * i))
  }

  if (rule.frequency === DAILY) {
    return stepped(first, cap, until, i => {
      const date = new Date(first)
      date.setDate(date.getDate() + rule.interval * i)
      return date
    })
  }

  if (rule.byDay?.length) return weeklyByDay(first, rule, cap, until)

  return stepped(first, cap, until, i => {
    const date = new Date(first)
    date.setDate(date.getDate() + rule.interval * 7 * i)
    return date
  })
}

export const describeRule = rule => {
  if (!rule) return null

  const [one, many] = UNITS[rule.frequency] || []
  if (!one) return null

  let head = rule.interval === 1 ? one : many.replace('{n}', rule.interval)

  const days = rule.byDay || []
  if (days.length) {
    const names = days.map(day => WEEKDAYS.find(d => d.code === day).label)
    head = `${head} on ${
      names.length > 1
        ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
        : names[0]
    }`
  }

  const ends = rule.ends || {}
  if (ends.type === COUNT) return `${head} · ${ends.count} dates`
  if (ends.type === UNTIL) {
    return `${head} · until ${new Date(ends.until).toLocaleDateString()}`
  }
  return `${head} · ongoing`
}
