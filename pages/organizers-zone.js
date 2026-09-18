import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Message,
  Spinner,
  Text
} from 'theme-ui'
import tt from 'tinytime'
import { Calendar, Plus, Users } from 'react-feather'
import AuthGate from '../components/auth-gate'
import ConfirmReason from '../components/confirm-reason'
import EventForm from '../components/event-form'
import Modal from '../components/modal'
import PageHeader, { PAGE_WIDTH } from '../components/page-header'
import { Eyebrow, MetaItem, MetaRow, Panel, PanelSection } from '../components/panel'
import StatusBadge from '../components/status-badge'
import TagList from '../components/tag-list'
import VenueLink from '../components/venue-link'
import { useSession } from '../components/session-context'
import { canCancel, canEdit, canWithdraw, statusOf } from '../lib/event-status'
import { EMPTY_EVENT_FORM, payloadFromForm } from '../lib/event-form'
import { errorFrom } from '../lib/api-error'
import { useKnownTags } from '../lib/use-known-tags'
import { relativeDay } from '../lib/when'
import { slugFor } from '../lib/slug'

const day = tt('{dddd} {MM} {DD}')
const clock = tt('{h}:{mm} {a}')

const when = event => {
  if (!event.startTime) return 'Date to be confirmed'
  const start = new Date(event.startTime)
  const end = event.endTime ? new Date(event.endTime) : null
  const range = end
    ? `${clock.render(start)} – ${clock.render(end)}`
    : clock.render(start)
  return `${day.render(start)} · ${range}`
}

const summarise = description => {
  if (!description) return null
  const text = description.replace(/\s+/g, ' ').trim()
  return text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text
}

const sectionFor = event => {
  const status = statusOf(event)
  if (status !== 'approved') return status
  const end = event.endTime ? new Date(event.endTime) : null
  return end && end.getTime() < Date.now() ? 'past' : 'current'
}

const COMPACT_BUTTON = { fontSize: 0, px: 2, py: 1, lineHeight: 'body' }

const SECTIONS = [
  { key: 'current', title: 'Current', accent: 'green' },
  { key: 'pending', title: 'Pending review', accent: 'orange' },
  { key: 'past', title: 'Past', accent: 'muted' },
  { key: 'cancelled', title: 'Cancelled', accent: 'muted' },
  { key: 'rejected', title: 'Not accepted', accent: 'muted' },
  { key: 'withdrawn', title: 'Withdrawn', accent: 'muted' }
]

const OrganizersZone = () => {
  const router = useRouter()
  const { session, capabilities, loading } = useSession()
  const { tags: knownTags } = useKnownTags()

  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [withdrawing, setWithdrawing] = useState(null)

  const [composing, setComposing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

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

  const closeCompose = () => {
    setComposing(false)
    setDiscarding(false)
    setDirty(false)
    setFormErrors({})
  }

  const askToClose = () => {
    if (dirty && !submitting) {
      setDiscarding(true)
      return
    }
    closeCompose()
  }

  const submitEvent = async form => {
    setSubmitting(true)
    setFormErrors({})

    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payloadFromForm(form))
    }).catch(() => null)

    if (!res) {
      setSubmitting(false)
      setFormErrors({ form: 'Could not reach the server. Try again.' })
      return
    }

    if (res.status === 401) {
      router.push(
        `/api/auth/login/?returnTo=${encodeURIComponent('/organizers-zone')}`
      )
      return
    }

    const body = await res.json().catch(() => ({}))
    setSubmitting(false)

    if (!res.ok) {
      setFormErrors(body.errors || { form: body.error || 'Something went wrong.' })
      return
    }

    closeCompose()
    setFlash('Sent for review. You’ll hear back in Slack.')
    await load()
  }

  const confirmCancel = async (reason, target = cancelling || withdrawing) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/events/${target.id}/cancel/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) {
        setError(await errorFrom(res, 'Could not cancel that event.'))
      } else {
        setFlash(`Cancelled “${target.title}”.`)
        await load()
      }
    } finally {
      setBusy(false)
      setCancelling(null)
      setWithdrawing(null)
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
        title="Organizers Zone"
        body="Sign in to run your events."
        returnTo="/organizers-zone"
      />
    )
  }

  const grouped = (events || []).reduce((acc, event) => {
    const key = sectionFor(event)
    acc[key] = [...(acc[key] || []), event]
    return acc
  }, {})

  const total = events?.length || 0

  return (
    <>
      <Meta as={Head} name="Hack Club Events" title="Organizers Zone" />

      <PageHeader
        title="Organizers Zone"
        subtitle={
          events === null
            ? 'Loading…'
            : total === 0
              ? 'Nothing here yet'
              : `${total} event${total === 1 ? '' : 's'}`
        }
        action={
          capabilities?.canSubmit && (
            <Button onClick={() => setComposing(true)}>
              <Plus />
              Submit an event
            </Button>
          )
        }
      />

      <Container sx={{ maxWidth: PAGE_WIDTH, py: [3, 4] }}>
        {flash && (
          <Message sx={{ mb: 3 }} onClick={() => setFlash(null)}>
            {flash}
          </Message>
        )}
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
          <Panel sx={{ textAlign: 'center' }}>
            <PanelSection sx={{ py: [4, 5] }}>
              <Heading as="h2" variant="subheadline" sx={{ mt: 0, mb: 2 }}>
                No events yet
              </Heading>
              <Text as="p" sx={{ color: 'muted', mb: 3 }}>
                {capabilities?.canSubmit
                  ? 'Put one on the calendar — it takes a couple of minutes.'
                  : 'You don’t have permission to submit events yet.'}
              </Text>
              {capabilities?.canSubmit && (
                <Button onClick={() => setComposing(true)}>
                  <Plus />
                  Submit an event
                </Button>
              )}
            </PanelSection>
          </Panel>
        )}

        {SECTIONS.map(({ key, title, accent }) =>
          grouped[key]?.length ? (
            <Box key={key} sx={{ mb: [4, 5] }}>
              <Flex
                sx={{
                  alignItems: 'baseline',
                  gap: 2,
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'border'
                }}
              >
                <Eyebrow sx={{ display: 'inline', color: accent }}>{title}</Eyebrow>
                <Text as="span" sx={{ fontSize: 0, color: 'muted' }}>
                  {grouped[key].length}
                </Text>
              </Flex>

              <Box sx={{ display: 'grid', gap: 2 }}>
                {grouped[key].map(event => (
                  <Panel key={event.id} accent={accent}>
                    <PanelSection dense>
                      <Flex
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 2,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Heading
                          as="h3"
                          sx={{ m: 0, fontSize: 2, lineHeight: 'heading' }}
                        >
                          {event.title}
                        </Heading>
                        <StatusBadge event={event} />
                      </Flex>

                      <MetaRow sx={{ mt: 1, fontSize: 0 }}>
                        <MetaItem icon={Calendar}>{when(event)}</MetaItem>
                        {key !== 'past' && (
                          <MetaItem icon={Users}>
                            {event.interestCount === 1
                              ? '1 going'
                              : `${event.interestCount || 0} going`}
                            {event.followerCount > 0 &&
                              ` · ${event.followerCount} following`}
                          </MetaItem>
                        )}
                        {event.eventLink && (
                          <VenueLink
                            url={event.eventLink}
                            channel={event.eventLinkChannel}
                            size={12}
                            sx={{ fontSize: 0, color: 'muted' }}
                          />
                        )}
                        {(key === 'pending' || key === 'current') && (
                          <Eyebrow sx={{ display: 'inline', color: accent }}>
                            {relativeDay(event.startTime)}
                          </Eyebrow>
                        )}
                      </MetaRow>

                      {summarise(event.description) && (
                        <Text
                          as="p"
                          sx={{
                            mt: 1,
                            mb: 0,
                            fontSize: 1,
                            color: 'secondary',
                            lineHeight: 'body',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {summarise(event.description)}
                        </Text>
                      )}

                      {event.cancellationReason && (
                        <Text
                          as="p"
                          sx={{ mt: 1, mb: 0, fontSize: 0, color: 'red' }}
                        >
                          {event.cancellationReason}
                        </Text>
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
                          {canEdit(session, event, capabilities) && (
                            <Link
                              href={`/events/${event.id}/edit`}
                              passHref
                              legacyBehavior
                            >
                              <Button as="a" variant="outline" sx={COMPACT_BUTTON}>
                                Edit
                              </Button>
                            </Link>
                          )}
                          {statusOf(event) === 'approved' && event.slug && (
                            <Link
                              href={`/${slugFor(event) || event.slug}`}
                              passHref
                              legacyBehavior
                            >
                              <Button as="a" variant="outline" sx={COMPACT_BUTTON}>
                                View
                              </Button>
                            </Link>
                          )}
                          {canWithdraw(session, event) ? (
                            <Button
                              variant="outline"
                              sx={{ ...COMPACT_BUTTON, color: 'red' }}
                              onClick={() => setWithdrawing(event)}
                            >
                              Withdraw
                            </Button>
                          ) : (
                            canCancel(session, event, capabilities) && (
                              <Button
                                variant="outline"
                                sx={{ ...COMPACT_BUTTON, color: 'red' }}
                                onClick={() => setCancelling(event)}
                              >
                                {event.seriesId ? 'Skip this date' : 'Cancel'}
                              </Button>
                            )
                          )}
                        </Flex>
                      </Flex>
                    </PanelSection>
                  </Panel>
                ))}
              </Box>
            </Box>
          ) : null
        )}
      </Container>

      {composing && (
        <Modal
          title={discarding ? 'Discard this draft?' : 'Submit an event'}
          subtitle={
            discarding
              ? 'Everything you have typed will be lost.'
              : 'Reviewed before it appears on the site.'
          }
          closable={!discarding}
          onDismiss={discarding ? () => setDiscarding(false) : askToClose}
        >
          {discarding ? (
            <Box sx={{ px: [3, 4], py: 3 }}>
              <Flex sx={{ gap: 2, flexWrap: 'wrap' }}>
                <Button sx={{ bg: 'red' }} onClick={closeCompose}>
                  Discard
                </Button>
                <Button variant="outline" onClick={() => setDiscarding(false)}>
                  Keep editing
                </Button>
              </Flex>
            </Box>
          ) : (
            <EventForm
              initialValues={EMPTY_EVENT_FORM}
              errors={formErrors}
              busy={submitting}
              embedded
              allowRecurrence
              onDirtyChange={setDirty}
              onSubmit={submitEvent}
              footer={
                <Button type="button" variant="outline" onClick={askToClose}>
                  Cancel
                </Button>
              }
            />
          )}
        </Modal>
      )}

      {(cancelling || withdrawing) && (
        <ConfirmReason
          event={cancelling || withdrawing}
          verb={withdrawing ? 'withdraw' : 'cancel'}
          requireReason={!withdrawing}
          consequence={
            withdrawing
              ? 'It’ll be taken out of the review queue.'
              : 'Everyone who RSVPed gets a DM with your reason.'
          }
          consequenceExtra={
            (cancelling || withdrawing)?.seriesId
              ? 'Only this date. The rest of the series keeps running.'
              : null
          }
          busy={busy}
          onConfirm={confirmCancel}
          onDismiss={() => {
            setCancelling(null)
            setWithdrawing(null)
          }}
        />
      )}
    </>
  )
}

export default OrganizersZone
