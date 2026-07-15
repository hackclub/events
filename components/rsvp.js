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
  const [showMenu, setShowMenu] = useState(false)

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowMenu(false)
    } catch (e) {
      console.error(`failed to copy ${label}`, e)
    }
  }

  const copyNames = () => copyToClipboard(
    attendees.map(a => a.name || a.slackDisplayName || a.slackId)
    .filter(Boolean).join('\n'), 'names'
  )
  
  const copyEmails = () => copyToClipboard(
    attendees.map(a => a.email).filter(Boolean).join('\n'), 'emails'
  )

  const copySlackIds = () => copyToClipboard(
    attendees.map(a => a.slackId).filter(Boolean).join('\n'), 'slack ids'
  )

  const copyFullList = () => copyToClipboard(
    attendees.map(a => `${a.name || a.slackDisplayName || ''}\t${a.email || ''}\t${a.slackId || ''}`)
    .join('\n'), 'attendees'
  )

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify(attendees, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${event.slug}-attendees.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    const headers = [
      'Name',
      'Slack Display Name',
      'Slack ID',
      'Email',
      'RSVPed At'
    ]

    const rows = attendees.map(a => [
      a.name || '',
      a.slackDisplayName || '',
      a.slackId || '',
      a.email || '',
      a.rsvpedAt || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => {
        return row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
      })
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${event.slug}-attendees.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

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
        setCount(data.InterestCount ?? count)
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
  
  const menuItemStyles = {
    width: '100%',

    px: 3,
    py: 2,

    textAlign: 'left',

    bg: 'transparent',

    border: 0,

    color: 'text',

    fontFamily: 'body',
    fontSize: 1,

    cursor: 'pointer',

    transition: 'background .12s ease',

    '&:hover': {
      bg: 'sunken'
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
          <Flex
            sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>Attendees ({attendees.length})</Text>
            {attendees.length > 0 && (
              <Flex sx={{ gap: 2, alignItems: 'center' }}>
                <Button onClick={exportCsv} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  fontSize: 0,
                  lineHeight: 1,
                  borderRadius: 9999,
                  bg: 'rgba(255,255,255,0.06)',
                  color: 'text',
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.08)',
                  transition: 'all .15s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    bg: 'rgba(255,255,255,0.10)',
                    borderColor: 'rgba(255,255,255,0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}>Export CSV</Button>
                  <Box sx={{ position: 'relative' }}>
                  <Button variant="secondary" onClick={() => setShowMenu(!showMenu)} sx={{
                    bg: 'transparent',
                    color: 'muted',
                    p: 1,
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 'circle',
                    '&:hover': {
                      bg: 'sunken'
                    }
                  }}>
                    ⋮
                  </Button>
                  {showMenu && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 10px)',
                        bg: 'background',
                        overflow: 'hidden',
                        border: '1px solid',
                        p: 2,
                        borderColor: 'border',
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                        minWidth: 200,
                        zIndex: 1000
                      }}
                    >
                      <Box
                        as="button"
                        onClick={copyNames}
                        sx={menuItemStyles}
                      >
                        Copy Names
                      </Box>

                      <Box
                        as="button"
                        onClick={copyEmails}
                        sx={menuItemStyles}
                      >
                        Copy Emails
                      </Box>

                      <Box
                        as="button"
                        onClick={copySlackIds}
                        sx={menuItemStyles}
                      >
                        Copy Slack IDs
                      </Box>

                      <Box
                        as="button"
                        onClick={copyFullList}
                        sx={menuItemStyles}
                      >
                        Copy Full List
                      </Box>

                      <Divider />

                      <Box
                        as="button"
                        onClick={exportJson}
                        sx={menuItemStyles}
                      >
                        Export JSON
                      </Box>
                    </Box>
                  )}
                </Box>
              </Flex>  
            )}
          </Flex>
          {attendees.length == 0 ? (
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
