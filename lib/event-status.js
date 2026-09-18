export const statusOf = event => {
  if (!event) return 'pending'
  if (event.cancelled) {
    if (event.cancellationType === 'rejected') return 'rejected'
    if (event.cancellationType === 'withdrawn') return 'withdrawn'
    return 'cancelled'
  }
  return event.approved ? 'approved' : 'pending'
}

export const endsAt = event => {
  const raw = event?.endTime ?? event?.end
  if (!raw) return null
  const at = new Date(raw).getTime()
  return Number.isNaN(at) ? null : at
}

export const hasEnded = (event, now = Date.now()) => {
  const at = endsAt(event)
  return at !== null && at < now
}

export const STATUS_META = {
  pending: { label: 'Pending review', color: 'orange' },
  approved: { label: 'Live', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'muted' },
  rejected: { label: 'Not accepted', color: 'muted' },
  withdrawn: { label: 'Withdrawn', color: 'muted' },
  ended: { label: 'Ended', color: 'muted' }
}

export const isLive = event => statusOf(event) === 'approved'

export const isFinished = event =>
  ['cancelled', 'rejected', 'withdrawn'].includes(statusOf(event))

export const sortForReview = events =>
  [...(events || [])].sort((a, b) =>
    String(a.startTime || '').localeCompare(String(b.startTime || ''))
  )

export const canEdit = (session, event, capabilities = {}) => {
  if (!session?.slackId || !event) return false
  if (isFinished(event)) return false
  if (capabilities.canReview) return true
  return event.leaderSlackId === session.slackId
}

export const canWithdraw = (session, event, now = Date.now()) =>
  Boolean(session?.slackId) &&
  Boolean(event) &&
  !isFinished(event) &&
  !hasEnded(event, now) &&
  !event.approved &&
  event.leaderSlackId === session.slackId

export const canCancel = (session, event, capabilities = {}, now = Date.now()) =>
  Boolean(capabilities.canReview) &&
  Boolean(event) &&
  !isFinished(event) &&
  !hasEnded(event, now)
