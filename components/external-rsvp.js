import { Button, Link } from 'theme-ui'

const ExternalRsvp = ({ event }) => {
  return (
    <Link href={event.rsvpFormUrl} target="_blank" rel="noopener noreferrer">
      <Button
        as="button"
        type="button"
        sx={{
          bg: 'cyan',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        RSVP
      </Button>
    </Link>
  )
}

export default ExternalRsvp
