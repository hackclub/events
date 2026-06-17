import { useState, useEffect } from 'react'
import { Box, Button, Text, Flex, Avatar, Divider } from 'theme-ui'

const AttendeeRow = ({ attendee }) => {
  const displayName =
    attendee.slackDisplayName || attendee.name || attendee.slackId

  const subName =
    attendee.slackDisplayName && attendee.name ? attendee.name : null

  return (
    <Flex sx={{ alignItems: 'center', gap: 3, py: 2 }}>
      <Avatar
        src={`https://cachet.dunkirk.sh/users/${attendee.slackId}/r`}
        alt={displayName}
        sx={{ height: 36, width: 36, flexShrink: 0, borderRadius: 'circle' }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Text
          sx={{
            fontSize: 1,
            fontWeight: 'bold',
            display: 'block',
            lineHeight: 1.2
          }}
        >
          {displayName}
        </Text>

        {subName && (
          <Text sx={{ fontSize: 0, color: 'muted', display: 'block' }}>
            {subName}
          </Text>
        )}

        {attendee.email && (
          <Text sx={{ fontSize: 0, color: 'muted', display: 'block' }}>
            {attendee.email}
          </Text>
        )}
        {attendee.slackId && <Text sx={{ fontSize: 0, color: 'muted', display: 'block' }}>{attendee.slackId}</Text>}
      </Box>
    </Flex>
  )
}

const Rsvp = ({ event }) => {
  const [session, setSession] = useState(null)
  const [attending, setAttending] = useState(false)
  const [count, setCount] = useState(event.interestCount || 0)
  const [loading, setLoading] = useState(false)
  const [attendees, setAttendees] = useState(null)
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me/')
    .then(r => r.json())
    .then(data => setSession(data))
    .catch(() => setSession({ slackId: null }))
  }, [])

  useEffect(() => {
    if (!session?.slackId) return
    const creator = session.slackId === event.leaderSlackId
    setIsCreator(creator)
    fetch(`/api/events/${event.id}/rsvps/`)
    .then(r => r.json())
    .then(data => {
        setCount(data.InterestCount ?? data.InterestCount ?? count)
        setAttending(data.attending || false)
        if (creator) setAttendees(data.attendees || [])
      }).catch(() => {})
  }, [session])

  const handleRsvp = async () => {
    if (!session?.slackId || loading) return
    setLoading(true)
    const newAttending = !attending
    try {
      const res = await fetch(`/api/events/${event.id}/rsvp/`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attending: newAttending }),
      })
      const data = await res.json()
      if (res.ok) {
        setAttending(newAttending)
        setCount(data.InterestCount)
        if (isCreator) {
          const rsvpRes = await fetch(`/api/events/${event.id}/rsvps/`)
          const rsvpData = await rsvpRes.json()
          setAttendees(rsvpData.attendees || [])
        } 
      }
    } catch (e) {
      // we're leaving it unchanged on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Flex sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <Button
          onClick={!session?.slackId ? undefined : handleRsvp}
          as={!session?.slackId ? 'a' : 'button'}
          href={!session?.slackId ? `/api/auth/login/?returnTo=${encodeURIComponent(`/${event.slug}`)}` : undefined}
          disabled={loading}
          sx={{
            bg: attending ? 'accent' : 'cyan',
            color: 'white',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {session === null
            ? 'RSVP'
            : !session.slackId
            ? 'Sign in to RSVP'
            : loading
            ? 'Saving...'
            : attending
            ? '✓ Going'
            : 'RSVP'}
        </Button>
        <Text sx={{ color: 'muted', fontSize: 1 }}>
          {count} {count === 1 ? 'person' : 'people'} going
        </Text>
      </Flex>
      {isCreator && attendees !== null && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          <Text sx={{ fontWeight: 'bold', mb: 1, fontSize: 1 }}>
            Attendees ({attendees.length})
          </Text>
          {attendees.lengt == 0 ? (
            <Text sx={{ color: 'muted', fontSize: 1 }}>No RSVPs yet.</Text>
          ) : (
            <Box>
              {attendees.map((attendee, i) => (
                <Box key={attendee.sub || attendee.slackId || i}>
                  <AttendeeRow attendee={attendee} />
                  {i < attendees.length - 1 && <Divider sx={{ my: 0, opacity: 0.3 }} />}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Rsvp
