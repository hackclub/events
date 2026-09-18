import { Badge } from 'theme-ui'
import { hasEnded, STATUS_META, statusOf } from '../lib/event-status'

const StatusBadge = ({ event, ...props }) => {
  const status = statusOf(event)
  const meta =
    STATUS_META[status === 'approved' && hasEnded(event) ? 'ended' : status]
  if (!meta) return null

  return (
    <Badge
      {...props}
      sx={{
        bg: meta.color,
        color: 'white',
        fontSize: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...props.sx
      }}
    >
      {meta.label}
    </Badge>
  )
}

export default StatusBadge
