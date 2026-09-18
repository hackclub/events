import { useCallback, useEffect, useState } from 'react'
import PageHeader, { PAGE_WIDTH } from '../components/page-header'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import {
  Box,
  Button,
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
import TagList from '../components/tag-list'
import VenueLink from '../components/venue-link'
import { sortForReview } from '../lib/event-status'
import { useKnownTags } from '../lib/use-known-tags'
import { errorFrom } from '../lib/api-error'
import {
  Eyebrow,
  MetaItem,
  MetaRow,
  Panel,
  PanelSection
} from '../components/panel'
import { Calendar, ExternalLink, User } from 'react-feather'
import { relativeDay } from '../lib/when'
import { describeSeries, groupSeries } from '../lib/series'
import AuditLog from '../components/audit-log'
import RunningEvents from '../components/running-events'
import { Repeat } from 'react-feather'

const when = event =>
  event.startTime
    ? tt('{MM} {DD}, {YYYY} at {h}:{mm} {a}').render(new Date(event.startTime))
    : 'Date to be confirmed'

const COMPACT_BUTTON = { fontSize: 0, px: 2, py: 1, lineHeight: 'body' }
const LONG_DESCRIPTION = 200

const TABS = [
  { key: 'review', label: 'Review' },
  { key: 'running', label: 'Running' },
  { key: 'log', label: 'Log' }
]

const ReviewersZone = () => {
  const { session, capabilities, loading } = useSession()
  const { tags: knownTags } = useKnownTags()
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('review')

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

  const act = async (event, path, body, describe, scope) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/events/${event.id}/${path}/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(scope ? { ...body, scope } : body)
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
        title="Reviewers Zone"
        body="Sign in to review submitted events."
        returnTo="/reviewers-zone"
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
      <Meta as={Head} name="Hack Club Events" title="Reviewers Zone" />
      <PageHeader
        title="Reviewers Zone"
        subtitle={
          events === null
            ? 'Loading…'
            : events.length === 0
              ? 'Queue’s clear.'
              : `${groupSeries(events).length} waiting to review`
        }
      />

      <Container sx={{ maxWidth: PAGE_WIDTH, pt: [3, 4] }}>
        <Flex
          role="tablist"
          sx={{
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'border'
          }}
        >
          {TABS.map(entry => (
            <Box
              key={entry.key}
              as="button"
              type="button"
              role="tab"
              aria-selected={tab === entry.key}
              onClick={() => setTab(entry.key)}
              sx={{
                px: 3,
                py: 2,
                border: 0,
                bg: 'transparent',
                fontFamily: 'body',
                fontSize: 1,
                fontWeight: tab === entry.key ? 'bold' : 'body',
                color: tab === entry.key ? 'text' : 'muted',
                cursor: 'pointer',
                borderBottom: '2px solid',
                borderColor: tab === entry.key ? 'primary' : 'transparent',
                mb: '-1px',
                ':hover': { color: 'text' }
              }}
            >
              {entry.label}
            </Box>
          ))}
        </Flex>
      </Container>

      <Container sx={{ maxWidth: PAGE_WIDTH, py: [3, 4] }}>
        {tab === 'running' && <RunningEvents onChanged={load} />}
        {tab === 'log' && <AuditLog />}

        {tab === 'review' && (
        <>
        {flash && <Message sx={{ mb: 3 }}>{flash}</Message>}
        {error && (
          <Message variant="alert" sx={{ mb: 3 }}>
            {error}
          </Message>
        )}

        {events === null && !error && <Spinner size={32} color="primary" />}

        <Box sx={{ display: 'grid', gap: 2 }}>
          {groupSeries(events).map(group => {
            const event = group.lead
            const series = describeSeries(group)
            const scope = group.count > 1 ? 'series' : undefined

            return (
            <Panel key={group.key} accent="orange">
              <PanelSection dense>
                <Flex
                  sx={{
                    gap: 2,
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                  }}
                >
                  <Heading
                    as="h2"
                    sx={{ m: 0, fontSize: 2, lineHeight: 'heading' }}
                  >
                    {event.title}
                  </Heading>
                  <Eyebrow sx={{ color: 'orange' }}>
                    {relativeDay(event.startTime)}
                  </Eyebrow>
                </Flex>

                <MetaRow sx={{ mt: 1, fontSize: 0 }}>
                  <MetaItem icon={Calendar}>{when(event)}</MetaItem>
                  {series && <MetaItem icon={Repeat}>{series}</MetaItem>}
                  <MetaItem icon={User}>{event.leader}</MetaItem>
                  {event.eventLink && (
                    <VenueLink
                      url={event.eventLink}
                      channel={event.eventLinkChannel}
                      size={12}
                      sx={{ fontSize: 0, color: 'muted' }}
                    />
                  )}
                  {event.rsvpFormUrl && (
                    <A
                      href={event.rsvpFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 0,
                        color: 'muted'
                      }}
                    >
                      <ExternalLink size={12} />
                      RSVP form
                    </A>
                  )}
                </MetaRow>

                <Text
                  as="p"
                  sx={{
                    mt: 1,
                    mb: 0,
                    fontSize: 1,
                    color: 'secondary',
                    lineHeight: 'body',
                    whiteSpace: 'pre-wrap',
                    ...(expanded === event.id
                      ? {}
                      : {
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        })
                  }}
                >
                  {event.description}
                </Text>

                {(event.description || '').length > LONG_DESCRIPTION && (
                  <Box
                    as="button"
                    type="button"
                    onClick={() =>
                      setExpanded(expanded === event.id ? null : event.id)
                    }
                    sx={{
                      mt: 1,
                      p: 0,
                      border: 0,
                      bg: 'transparent',
                      color: 'accent',
                      fontFamily: 'body',
                      fontSize: 0,
                      cursor: 'pointer',
                      ':hover': { textDecoration: 'underline' }
                    }}
                  >
                    {expanded === event.id ? 'Show less' : 'Read all'}
                  </Box>
                )}

                <Flex
                  sx={{
                    mt: 2,
                    gap: 2,
                    rowGap: 2,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                  }}
                >
                  <TagList tags={event.tags} knownTags={knownTags} />

                  <Flex sx={{ gap: 2, flexWrap: 'wrap', ml: 'auto' }}>
                    {confirming === event.id ? (
                      <>
                        <Text sx={{ fontSize: 0, alignSelf: 'center' }}>
                          {scope ? `Publish all ${group.count} dates?` : 'Publish it?'}
                        </Text>
                        <Button
                          disabled={busy}
                          sx={COMPACT_BUTTON}
                          onClick={() =>
                            act(
                              event,
                              'approve',
                              {},
                              scope
                                ? `Approved all ${group.count} dates of “${event.title}”.`
                                : `Approved “${event.title}”. It'll show up on the site within a minute.`,
                              scope
                            )
                          }
                        >
                          Yes, publish
                        </Button>
                        <Button
                          variant="outline"
                          disabled={busy}
                          sx={COMPACT_BUTTON}
                          onClick={() => setConfirming(null)}
                        >
                          Nevermind
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          sx={COMPACT_BUTTON}
                          onClick={() => setConfirming(event.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          sx={{ ...COMPACT_BUTTON, color: 'red' }}
                          onClick={() =>
                            setRejecting({ ...event, seriesCount: group.count })
                          }
                        >
                          Reject
                        </Button>
                        <Link
                          href={`/events/${event.id}/edit?from=review`}
                          passHref
                          legacyBehavior
                        >
                          <Button as="a" variant="outline" sx={COMPACT_BUTTON}>
                            Edit
                          </Button>
                        </Link>
                      </>
                    )}
                  </Flex>
                </Flex>
              </PanelSection>
            </Panel>
            )
          })}
        </Box>
        </>
        )}
      </Container>

      {rejecting && (
        <ConfirmReason
          event={rejecting}
          verb="reject"
          consequence="The organiser gets a Slack message with your reason."
          busy={busy}
          consequenceExtra={
            rejecting.seriesCount > 1
              ? `All ${rejecting.seriesCount} dates will be rejected.`
              : null
          }
          onConfirm={reason =>
            act(
              rejecting,
              'cancel',
              { reason, kind: 'rejected' },
              rejecting.seriesCount > 1
                ? `Rejected all ${rejecting.seriesCount} dates of “${rejecting.title}”.`
                : `Rejected “${rejecting.title}”.`,
              rejecting.seriesCount > 1 ? 'series' : undefined
            )
          }
          onDismiss={() => setRejecting(null)}
        />
      )}
    </>
  )
}

export default ReviewersZone
