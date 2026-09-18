export const SLACK_WORKSPACE = 'hackclub.slack.com'

const CHANNEL_ID = /^[CGD][A-Z0-9]{2,}$/

const channelUrl = name =>
  `https://${SLACK_WORKSPACE}/app_redirect?channel=${encodeURIComponent(name)}`

const HAS_SCHEME = /^[a-z][a-z0-9+-]*:/i
const BARE_HOST = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]|$)/i

const tidy = url => {
  try {
    return new URL(url).href
  } catch {
    return url
  }
}

const EMBEDDED_URL = /https?:\/\/[^\s<>"']+/

export const normaliseVenue = value => {
  const raw = String(value || '').trim()
  if (!raw) return ''

  if (raw.startsWith('#')) {
    const name = raw.slice(1).trim().replace(/\s+/g, '-').toLowerCase()
    return name ? channelUrl(name) : ''
  }

  if (HAS_SCHEME.test(raw)) return raw
  if (BARE_HOST.test(raw)) return tidy(`https://${raw}`)

  const embedded = raw.match(EMBEDDED_URL)
  if (embedded) return embedded[0].replace(/[.,!?)]+$/, '')

  return raw
}

const parse = url => {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

const isSlack = host => host === 'slack.com' || host.endsWith('.slack.com')

const slackTarget = parsed => {
  const byName = parsed.searchParams.get('channel')
  if (parsed.pathname === '/app_redirect' && byName) {
    return { kind: 'channel', name: byName }
  }

  const huddle = parsed.pathname.match(/^\/huddle\/T[A-Z0-9]+\/([CGD][A-Z0-9]+)/)
  if (huddle) return { kind: 'huddle', id: huddle[1] }

  if (parsed.pathname.startsWith('/huddle/')) return { kind: 'huddle' }

  const archive = parsed.pathname.match(
    /^\/archives\/([CGD][A-Z0-9]+)(\/p\d+)?/
  )
  if (archive) {
    return archive[2]
      ? { kind: 'message', id: archive[1] }
      : { kind: 'channel', id: archive[1] }
  }

  const client = parsed.pathname.match(/^\/client\/[TE][A-Z0-9]+\/([CGD][A-Z0-9]+)/)
  if (client) return { kind: 'channel', id: client[1] }

  return { kind: 'slack' }
}

const slackLabel = (target, name) => {
  const channel = name || target.name

  switch (target.kind) {
    case 'channel':
      return channel ? `#${channel}` : 'Slack channel'
    case 'huddle':
      return channel ? `Huddle in #${channel}` : 'Slack huddle'
    case 'message':
      return channel ? `Message in #${channel}` : 'Slack message'
    default:
      return 'Slack'
  }
}

const ZOOM_SHORTLINK = /^\/z-join(\/|$)/i

const OTHERS = [
  { match: host => host.endsWith('zoom.us'), kind: 'video', label: 'Zoom' },
  {
    match: (host, parsed) =>
      (host === 'hack.af' || host === 'hack.club') &&
      ZOOM_SHORTLINK.test(parsed.pathname),
    kind: 'video',
    label: 'Zoom'
  },
  {
    match: host => host === 'meet.google.com',
    kind: 'video',
    label: 'Google Meet'
  },
  {
    match: host => host === 'teams.microsoft.com',
    kind: 'video',
    label: 'Microsoft Teams'
  },
  {
    match: host => host === 'discord.gg' || host.endsWith('discord.com'),
    kind: 'chat',
    label: 'Discord'
  },
  {
    match: host => host.endsWith('youtube.com') || host === 'youtu.be',
    kind: 'stream',
    label: 'YouTube'
  },
  { match: host => host.endsWith('twitch.tv'), kind: 'stream', label: 'Twitch' },
  {
    match: host =>
      host === 'hack.af' || host === 'hack.club' || host.endsWith('hackclub.com'),
    kind: 'link',
    label: 'Hack Club'
  },
  { match: host => host.endsWith('github.com'), kind: 'link', label: 'GitHub' },
  { match: host => host.endsWith('figma.com'), kind: 'link', label: 'Figma' }
]

export const channelIdOf = value => {
  const href = normaliseVenue(value)
  if (!href) return null

  const parsed = parse(href)
  if (!parsed || parsed.protocol !== 'https:') return null
  if (!isSlack(parsed.hostname.toLowerCase())) return null

  const target = slackTarget(parsed)
  return target.id && CHANNEL_ID.test(target.id) ? target.id : null
}

export const channelIdsIn = values =>
  Array.from(
    new Set(
      (values || []).map(channelIdOf).filter(Boolean)
    )
  )

export const describeVenue = (value, channelName) => {
  const href = normaliseVenue(value)
  if (!href) return null

  const parsed = parse(href)
  if (!parsed || parsed.protocol !== 'https:') return null

  const host = parsed.hostname.toLowerCase()

  if (isSlack(host)) {
    const target = slackTarget(parsed)
    return { kind: target.kind, label: slackLabel(target, channelName), href }
  }

  const other = OTHERS.find(entry => entry.match(host, parsed))
  if (other) return { kind: other.kind, label: other.label, href }

  return { kind: 'link', label: host.replace(/^www\./, ''), href }
}
