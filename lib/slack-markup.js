import { SLACK_WORKSPACE } from './venue'

const MENTION = /<([#@!])([A-Za-z0-9^]+)(?:\|([^>]*))?>/g
const LOOKUP_ID = /^[CGDUW][A-Z0-9]{2,}$/
const PIPED_LINK = /<(https?:\/\/[^|>\s]+)\|([^>]*)>/g
const BARE_LINK = /<(https?:\/\/[^|>\s]+)>/g

const channelHref = name =>
  `https://${SLACK_WORKSPACE}/app_redirect?channel=${encodeURIComponent(name)}`

const archiveHref = id => `https://${SLACK_WORKSPACE}/archives/${id}`

const userHref = id => `https://${SLACK_WORKSPACE}/team/${id}`

export const slackIdsIn = text =>
  Array.from(
    new Set(
      Array.from(String(text || '').matchAll(MENTION))
        .filter(([, sigil, id, label]) => sigil !== '!' && !label && LOOKUP_ID.test(id))
        .map(([, , id]) => id)
    )
  )

const resolve = (sigil, id, label, names) => {
  if (sigil === '!') {
    return { text: label || `@${id.toLowerCase()}`, href: null }
  }

  const known = names?.[id]
  const name = label || known?.name

  if (sigil === '#') {
    return name
      ? { text: `#${name}`, href: channelHref(name) }
      : { text: 'a Slack channel', href: archiveHref(id) }
  }

  return name
    ? { text: `@${name}`, href: userHref(id) }
    : { text: 'someone on Slack', href: userHref(id) }
}

const escapeMarkdown = text => text.replace(/([[\]])/g, '\\$1')

export const slackMarkupToMarkdown = (text, names) =>
  String(text || '')
    .replace(PIPED_LINK, (_, href, label) => `[${escapeMarkdown(label)}](${href})`)
    .replace(BARE_LINK, (_, href) => href)
    .replace(MENTION, (match, sigil, id, label) => {
      const { text: shown, href } = resolve(sigil, id, label, names)
      return href ? `[${escapeMarkdown(shown)}](${href})` : shown
    })

export const slackMarkupToPlain = (text, names) =>
  String(text || '')
    .replace(PIPED_LINK, (_, href, label) => label || href)
    .replace(BARE_LINK, (_, href) => href)
    .replace(
      MENTION,
      (match, sigil, id, label) => resolve(sigil, id, label, names).text
    )
