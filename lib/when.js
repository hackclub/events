const DAY = 24 * 60 * 60 * 1000

export const relativeDay = (iso, now = Date.now()) => {
  if (!iso) return 'No date'

  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return 'No date'

  const days = Math.round((at - now) / DAY)

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days < 7) return `In ${days} days`
  if (days >= 7 && days < 14) return 'Next week'
  if (days >= 14) return `In ${Math.round(days / 7)} weeks`
  if (days < -1 && days > -7) return `${-days} days ago`
  if (days <= -7 && days > -14) return 'Last week'
  return `${Math.round(-days / 7)} weeks ago`
}
