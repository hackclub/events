export const statusOf = event => {
  if (!event) return 'pending'
  if (event.cancelled) {
    return event.cancellationType === 'rejected' ? 'rejected' : 'cancelled'
  }
  return event.approved ? 'approved' : 'pending'
}

export const STATUS_META = {
  pending: { label: 'Pending review', color: 'orange' },
  approved: { label: 'Live', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'muted' },
  rejected: { label: 'Not accepted', color: 'muted' }
}

export const isLive = event => statusOf(event) === 'approved'

export const isFinished = event =>
  statusOf(event) === 'cancelled' || statusOf(event) === 'rejected'

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

export const canCancel = (session, event, capabilities = {}) =>
  Boolean(capabilities.canReview) && Boolean(event) && !isFinished(event)
