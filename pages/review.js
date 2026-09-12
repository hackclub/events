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
  Link as A,
  Message,
  Spinner,
  Text
} from 'theme-ui'
import tt from 'tinytime'
import AuthGate from '../components/auth-gate'
import ConfirmReason from '../components/confirm-reason'
import { useSession } from '../components/session-context'
import { sortForReview } from '../lib/event-status'
import { isUnestablished, useKnownTags } from '../lib/use-known-tags'
import { errorFrom } from '../lib/api-error'

const when = event =>
  event.startTime
    ? tt('{MM} {DD}, {YYYY} at {h}:{mm} {a}').render(new Date(event.startTime))
    : 'Date to be confirmed'

const Review = () => {
  const { session, capabilities, loading } = useSession()
  const { tags: knownTags } = useKnownTags()
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/events/pending/')
      if (!res.ok) {
        throw new Error(await errorFrom(res, 'Could not load the review queue.'))
      }
      const body = await res.json()
      setEvents(sortForReview(body.events || []))
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (capabilities.canReview) load()
  }, [capabilities.canReview, load])

  const act = async (event, path, body, describe) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/events/${event.id}/${path}/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.status === 409) {
        setFlash('Someone already handled that one.')
      } else if (!res.ok) {
        setError(await errorFrom(res, 'That did not work.'))
      } else {
        setFlash(describe)
      }
    } finally {
      setBusy(false)
      setConfirming(null)
      setRejecting(null)
      await load()
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
        title="Review queue"
        body="Sign in to review submitted events."
        returnTo="/review"
      />
    )
  }

  if (capabilities.unavailable) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          Couldn’t check your permissions
        </Heading>
        <Text as="p" variant="subtitle">
          The events service didn’t answer. This is not a permissions problem —
          try again in a moment.
        </Text>
      </Container>
    )
  }

  if (!capabilities.canReview) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          Nothing to review here
        </Heading>
        <Text as="p" variant="subtitle">
          This page is for the events team.
        </Text>
      </Container>
    )
  }

  return (
    <>
      <Meta as={Head} name="Hack Club Events" title="Review queue" />
      <Box as="header" sx={{ bg: 'sheet', textAlign: 'center', py: [3, 4] }}>
        <Heading as="h1" variant="title">
          Review queue
        </Heading>
        <Text as="p" variant="subtitle" sx={{ mt: 2 }}>
          {events === null
            ? 'Loading…'
            : events.length === 0
              ? 'Queue’s clear.'
              : `${events.length} event${events.length === 1 ? '' : 's'} waiting`}
        </Text>
      </Box>

      <Container sx={{ maxWidth: 'copyPlus', py: [3, 4] }}>
        {flash && <Message sx={{ mb: 3 }}>{flash}</Message>}
        {error && (
          <Message variant="alert" sx={{ mb: 3 }}>
            {error}
          </Message>
        )}

        {events === null && !error && <Spinner size={32} color="primary" />}

        <Box sx={{ display: 'grid', gap: 3 }}>
          {events?.map(event => (
            <Card key={event.id}>
              <Heading as="h2" variant="subheadline" sx={{ mt: 0, mb: 1 }}>
                {event.title}
              </Heading>
              <Text as="p" sx={{ fontSize: 1, color: 'muted' }}>
                {when(event)} · {event.leader}
              </Text>

              <Text as="p" sx={{ my: 3, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Text>

              <Box sx={{ fontSize: 1, mb: 3 }}>
                {event.eventLink && (
                  <Text as="p">
                    Location: <A href={event.eventLink}>{event.eventLink}</A>
                  </Text>
                )}
                {event.rsvpFormUrl && (
                  <Text as="p">
                    RSVP form: <A href={event.rsvpFormUrl}>{event.rsvpFormUrl}</A>
                  </Text>
                )}
                {event.tags?.length > 0 && (
                  <Flex sx={{ gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {event.tags.map(tag => (
                      <Flex
                        key={tag}
                        sx={{
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: '3px',
                          borderRadius: 'circle',
                          bg: isUnestablished(tag, knownTags) ? 'background' : 'sunken',
                          border: '1px solid',
                          borderColor: isUnestablished(tag, knownTags) ? 'orange' : 'sunken',
                          borderStyle: isUnestablished(tag, knownTags) ? 'dashed' : 'solid',
                          fontSize: 0,
                          lineHeight: 1
                        }}
                      >
                        <Text as="span">{tag.replace(/-/g, ' ')}</Text>
                        {isUnestablished(tag, knownTags) && (
                          <Text
                            as="span"
                            sx={{
                              color: 'orange',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em'
                            }}
                          >
                            new
                          </Text>
                        )}
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>

              {confirming === event.id ? (
                <Flex sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text sx={{ fontSize: 1 }}>Publish “{event.title}”?</Text>
                  <Button
                    disabled={busy}
                    onClick={() =>
                      act(event, 'approve', {}, `Approved “${event.title}”. It'll show up on the site within a minute.`)
                    }
                  >
                    Yes, publish
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => setConfirming(null)}>
                    Nevermind
                  </Button>
                </Flex>
              ) : (
                <Flex sx={{ gap: 2, flexWrap: 'wrap' }}>
                  <Button onClick={() => setConfirming(event.id)}>Approve</Button>
                  <Button
                    variant="outline"
                    sx={{ color: 'red' }}
                    onClick={() => setRejecting(event)}
                  >
                    Reject
                  </Button>
                  <Link href={`/events/${event.id}/edit?from=review`} passHref legacyBehavior>
                    <Button as="a" variant="outline">
                      Edit
                    </Button>
                  </Link>
                </Flex>
              )}
            </Card>
          ))}
        </Box>
      </Container>

      {rejecting && (
        <ConfirmReason
          event={rejecting}
          verb="reject"
          consequence="The organiser gets a Slack message with your reason."
          busy={busy}
          onConfirm={reason =>
            act(rejecting, 'cancel', { reason, kind: 'rejected' }, `Rejected “${rejecting.title}”.`)
          }
          onDismiss={() => setRejecting(null)}
        />
      )}
    </>
  )
}

export default Review
