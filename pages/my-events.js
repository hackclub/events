import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Message,
  Spinner,
  Text
} from 'theme-ui'
import tt from 'tinytime'
import AuthGate from '../components/auth-gate'
import ConfirmReason from '../components/confirm-reason'
import StatusBadge from '../components/status-badge'
import { useSession } from '../components/session-context'
import { canCancel, canEdit, statusOf } from '../lib/event-status'
import { errorFrom } from '../lib/api-error'

const when = event =>
  event.startTime
    ? tt('{MM} {DD}, {YYYY} at {h}:{mm} {a}').render(new Date(event.startTime))
    : 'Date to be confirmed'

const SECTIONS = [
  { key: 'pending', title: 'Pending review' },
  { key: 'approved', title: 'Live' },
  { key: 'cancelled', title: 'Cancelled' },
  { key: 'rejected', title: 'Not accepted' }
]

const MyEvents = () => {
  const { session, capabilities, loading } = useSession()
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/events/mine/')
      if (!res.ok) {
        throw new Error(await errorFrom(res, 'Could not load your events.'))
      }
      const body = await res.json()
      setEvents(body.events || [])
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (session?.slackId) load()
  }, [session, load])

  const confirmCancel = async reason => {
    setBusy(true)
    try {
      const res = await fetch(`/api/events/${cancelling.id}/cancel/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) {
        setError(await errorFrom(res, 'Could not cancel that event.'))
      } else {
        setFlash(`Cancelled “${cancelling.title}”.`)
        await load()
      }
    } finally {
      setBusy(false)
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Spinner size={48} color="primary" />
      </Box>
    )
  }

  if (!session?.slackId) {
    return (
      <AuthGate
        title="Your events"
        body="Sign in to see the events you've submitted."
        returnTo="/my-events"
      />
    )
  }

  const grouped = (events || []).reduce((acc, event) => {
    const key = statusOf(event)
    acc[key] = [...(acc[key] || []), event]
    return acc
  }, {})

  return (
    <>
      <Meta as={Head} name="Hack Club Events" title="Your events" />
      <Box as="header" sx={{ bg: 'sheet', textAlign: 'center', py: [3, 4] }}>
        <Heading as="h1" variant="title">
          Your events
        </Heading>
      </Box>

      <Container sx={{ maxWidth: 'copyPlus', py: [3, 4] }}>
        {flash && <Message sx={{ mb: 3 }}>{flash}</Message>}
        {error && (
          <Message variant="alert" sx={{ mb: 3 }}>
            {error}{' '}
            <Button variant="outline" sx={{ ml: 2 }} onClick={load}>
              Try again
            </Button>
          </Message>
        )}

        {events === null && !error && <Spinner size={32} color="primary" />}

        {events?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Text as="p" variant="subtitle" sx={{ mb: 3 }}>
              You haven’t submitted an event yet.
            </Text>
            <Link href="/submit" passHref legacyBehavior>
              <Button as="a">Submit one</Button>
            </Link>
          </Box>
        )}

        {SECTIONS.map(({ key, title }) =>
          grouped[key]?.length ? (
            <Box key={key} sx={{ mb: [3, 4] }}>
              <Heading as="h2" variant="headline" sx={{ color: 'accent' }}>
                {title}
              </Heading>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {grouped[key].map(event => (
                  <Card key={event.id}>
                    <Flex
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: 2,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Box>
                        <Heading as="h3" variant="subheadline" sx={{ m: 0 }}>
                          {event.title}
                        </Heading>
                        <Text as="p" sx={{ fontSize: 1, color: 'muted' }}>
                          {when(event)}
                        </Text>
                      </Box>
                      <StatusBadge event={event} />
                    </Flex>

                    {event.cancellationReason && (
                      <Message variant="alert" sx={{ mt: 2, fontSize: 1 }}>
                        {event.cancellationReason}
                      </Message>
                    )}

                    <Flex sx={{ gap: 2, mt: 3, flexWrap: 'wrap' }}>
                      {canEdit(session, event, capabilities) && (
                        <Link href={`/events/${event.id}/edit`} passHref legacyBehavior>
                          <Button as="a" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      )}
                      {statusOf(event) === 'approved' && event.slug && (
                        <Link href={`/${event.slug}`} passHref legacyBehavior>
                          <Button as="a" variant="outline">
                            View
                          </Button>
                        </Link>
                      )}
                      {canCancel(session, event, capabilities) && (
                        <Button
                          variant="outline"
                          sx={{ color: 'red' }}
                          onClick={() => setCancelling(event)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Flex>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : null
        )}
      </Container>

      {cancelling && (
        <ConfirmReason
          event={cancelling}
          verb="cancel"
          consequence="This removes the event from the site. Anyone who RSVPed is notified."
          busy={busy}
          onConfirm={confirmCancel}
          onDismiss={() => setCancelling(null)}
        />
      )}
    </>
  )
}

export default MyEvents
