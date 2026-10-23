export const adminSlackIds = (value = process.env.ADMIN_SLACK_IDS) =>
  String(value || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)

export const isAdmin = slackId =>
  Boolean(slackId) && adminSlackIds().includes(slackId)

export const attendeeAccess = (slackId, leaderSlackId) => {
  if (isAdmin(slackId)) return 'full'
  if (slackId && slackId === leaderSlackId) return 'limited'
  return 'none'
}

export const limitAttendee = attendee => ({
  slackId: attendee.slackId || null,
  slackDisplayName: attendee.slackDisplayName || null
})
