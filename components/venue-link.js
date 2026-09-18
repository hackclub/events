import { Link as A } from 'theme-ui'
import {
  Headphones,
  Link as LinkIcon,
  MessageSquare,
  Slack,
  Tv,
  Video
} from 'react-feather'
import { describeVenue } from '../lib/venue'

const ICONS = {
  channel: Slack,
  huddle: Headphones,
  message: MessageSquare,
  slack: Slack,
  video: Video,
  chat: MessageSquare,
  stream: Tv,
  link: LinkIcon
}

const VenueLink = ({ url, channel, size = 14, sx }) => {
  const venue = describeVenue(url, channel)
  if (!venue) return null

  const Icon = ICONS[venue.kind] || LinkIcon

  return (
    <A
      href={venue.href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        ':hover': { textDecoration: 'underline' },
        ...sx
      }}
    >
      <Icon size={size} />
      {venue.label}
    </A>
  )
}

export default VenueLink
