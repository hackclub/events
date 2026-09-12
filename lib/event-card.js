// The fields components/event.js actually renders. Everything else — notably
// desc and cal, which are the two largest — is dropped so pages listing many
// events do not ship them as page data for nothing.
export const toCard = event => ({
  id: event.id,
  slug: event.slug,
  title: event.title ?? null,
  leader: event.leader ?? null,
  avatar: event.avatar ?? '',
  start: event.start,
  end: event.end,
  tags: event.tags ?? []
})
