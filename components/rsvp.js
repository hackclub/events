import { useState, useEffect } from 'react'
import { Box, Button, Text, Flex, Avatar } from 'theme-ui'

const Rsvp = ({ event }) => {
  const [session, setSession] = useState(null)
  const [attending, setAttending] = useState(false)
  const [count, setCount] = useState(event.interestCount || 0)
  const [loading, setLoading] = useState(false)
  const [rsvpList, setRsvpList] = useState(null)
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me/')
    .then(r => r.json())
    .then(data => setSession(data))
    .catch(() => setSession({ slackId: null }))
  }, [])

  useEffect(() => {
  if (!session || !session.slackId) return
  if (session.slackId === event.leaderSlackId) {
    setIsCreator(true)
    fetch(`/api/events/${event.id}/rsvps/`)
      .then(r => r.json())
      .then(data => {
        console.log('creator rsvps response:', data)
        setRsvpList(data.InterestedUsers || [])
        setCount(data.InterestCount || 0)
        setAttending(data.attending || false)
      })
      .catch(() => {})
  } else {
    fetch(`/api/events/${event.id}/rsvps/`)
      .then(r => r.json())
      .then(data => {
        console.log('non-creator rsvps response:', data)
        setCount(data.interestCount ?? count)
        setAttending(data.attending || false)
      })
      .catch(() => {})
  }
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

      {isCreator && rsvpList !== null && (
        <Box sx={{ mt: 3 }}>
          <Text sx={{ fontWeight: 'bold', mb: 2, fontSize: 1 }}>
            Attendees ({rsvpList.length})
          </Text>
          {rsvpList.length === 0 ? (
            <Text sx={{ color: 'muted', fontSize: 1 }}>No RSVPs yet.</Text>
          ) : (
            <Flex sx={{ flexWrap: 'wrap', gap: 2 }}>
              {rsvpList.map(slackId => (
                <Flex key={slackId} sx={{ alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={`https://cachet.dunkirk.sh/users/${slackId}/r`}
                    alt={slackId}
                    size={24}
                    sx={{ height: 24, width: 24 }}
                  />
                  <Text sx={{ fontSize: 0, color: 'muted' }}>{slackId}</Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Rsvp
