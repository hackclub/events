import { Button } from 'theme-ui'

const ExternalRsvp = ({ event }) => {
  if (!event.rsvpFormUrl?.startsWith('https://')) return null

  return (
    <Button
      as="a"
      href={event.rsvpFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        bg: 'cyan',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      RSVP
    </Button>
  )
}

export default ExternalRsvp
