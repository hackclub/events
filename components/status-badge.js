import { Badge } from 'theme-ui'
import { STATUS_META, statusOf } from '../lib/event-status'

const StatusBadge = ({ event, ...props }) => {
  const meta = STATUS_META[statusOf(event)]
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
