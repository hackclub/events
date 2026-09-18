import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Box, Button, Flex, Heading, Spinner, Text } from 'theme-ui'
import tt from 'tinytime'
import { Calendar, Users } from 'react-feather'
import ConfirmReason from './confirm-reason'
import VenueLink from './venue-link'
import { Eyebrow, MetaItem, MetaRow, Panel, PanelSection } from './panel'
import { errorFrom } from '../lib/api-error'
import { describeSeries, groupSeries } from '../lib/series'
import { relativeDay } from '../lib/when'

const day = tt('{dddd} {MM} {DD}')
const clock = tt('{h}:{mm} {a}')

const COMPACT_BUTTON = { fontSize: 0, px: 2, py: 1, lineHeight: 'body' }

const when = event => {
  if (!event.startTime) return 'Date to be confirmed'
  const start = new Date(event.startTime)
  return `${day.render(start)} · ${clock.render(start)}`
}

const RunningEvents = ({ onChanged }) => {
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [stopping, setStopping] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/events/running/')
      if (!res.ok) {
        throw new Error(await errorFrom(res, 'Could not load running events.'))
      }
      const body = await res.json()
      setEvents(body.events || [])
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stop = async (reason, scope) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/events/${stopping.event.id}/cancel/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason, kind: 'cancelled', scope })
      })
      if (!res.ok) {
        setError(await errorFrom(res, 'That did not work.'))
      } else {
        setFlash(
          scope === 'following'
            ? `Stopped “${stopping.event.title}” and every date after it.`
            : `Cancelled “${stopping.event.title}”.`
        )
      }
    } finally {
      setBusy(false)
      setStopping(null)
      await load()
      onChanged?.()
    }
  }

  if (events === null && !error) return <Spinner size={32} color="primary" />

  if (error) {
    return (
      <Text as="p" sx={{ color: 'red', fontSize: 1 }}>
        {error}
      </Text>
    )
  }

  const groups = groupSeries(events)

  return (
    <Box>
      {flash && (
        <Text as="p" sx={{ fontSize: 1, color: 'green', mb: 3 }}>
          {flash}
        </Text>
      )}

      {groups.length === 0 && (
        <Text as="p" sx={{ color: 'muted', fontSize: 1 }}>
          Nothing is running right now.
        </Text>
      )}

      <Box sx={{ display: 'grid', gap: 2 }}>
        {groups.map(group => {
          const event = group.lead
          const series = describeSeries(group)

          return (
            <Panel key={group.key} accent="green">
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
                    as="h3"
                    sx={{ m: 0, fontSize: 2, lineHeight: 'heading' }}
                  >
                    {event.title}
                  </Heading>
                  <Eyebrow sx={{ color: 'green' }}>
                    {relativeDay(event.startTime)}
                  </Eyebrow>
                </Flex>

                <MetaRow sx={{ mt: 1, fontSize: 0 }}>
                  <MetaItem icon={Calendar}>{when(event)}</MetaItem>
                  <MetaItem icon={Users}>
                    {event.interestCount === 1
                      ? '1 going'
                      : `${event.interestCount || 0} going`}
                    {event.followerCount > 0 &&
                      ` · ${event.followerCount} following`}
                  </MetaItem>
                  {series && <Text as="span">{series}</Text>}
                  {event.eventLink && (
                    <VenueLink
                      url={event.eventLink}
                      channel={event.eventLinkChannel}
                      size={12}
                      sx={{ fontSize: 0, color: 'muted' }}
                    />
                  )}
                </MetaRow>

                <Flex sx={{ mt: 2, gap: 2, flexWrap: 'wrap' }}>
                  <Link
                    href={`/events/${event.id}/edit?from=reviewers-zone`}
                    passHref
                    legacyBehavior
                  >
                    <Button as="a" variant="outline" sx={COMPACT_BUTTON}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    sx={{ ...COMPACT_BUTTON, color: 'red' }}
                    onClick={() => setStopping({ event, scope: 'this' })}
                  >
                    {group.count > 1 ? 'Cancel this date' : 'Cancel'}
                  </Button>

                  {group.count > 1 && (
                    <Button
                      variant="outline"
                      sx={{ ...COMPACT_BUTTON, color: 'red' }}
                      onClick={() => setStopping({ event, scope: 'following' })}
                    >
                      Stop the series
                    </Button>
                  )}
                </Flex>
              </PanelSection>
            </Panel>
          )
        })}
      </Box>

      {stopping && (
        <ConfirmReason
          event={stopping.event}
          verb="cancel"
          consequence="Everyone who RSVPed gets a DM with your reason."
          consequenceExtra={
            stopping.scope === 'following'
              ? 'This date and every date after it will be cancelled.'
              : null
          }
          busy={busy}
          onConfirm={reason => stop(reason, stopping.scope)}
          onDismiss={() => setStopping(null)}
        />
      )}
    </Box>
  )
}

export default RunningEvents
