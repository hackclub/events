import {
  Avatar,
  BaseStyles,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Link,
  Spinner,
  Text
} from 'theme-ui'
import { Calendar, Download, Video, Youtube } from 'react-feather'
import { Message } from 'theme-ui'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import tt from 'tinytime'
import ReactPlayer from 'react-player'
import { useState, useEffect } from 'react'

import Rsvp from '../components/rsvp'
import AMARsvp from '../components/ama-rsvp'
import ExternalRsvp from '../components/external-rsvp'
import { getEvents, getPublicEvents } from '../lib/data'
import { describeVenue } from '../lib/venue'
import VenueLink from '../components/venue-link'
import SeriesDates from '../components/series-dates'
import { buildCalendar } from '../lib/ics'
import { isHappeningNow } from '../lib/calendar'
import { find, map } from 'lodash'
import { parse } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

const fullDate = event => tt('{MM} {DD}, {YYYY}').render(new Date(event.start))

const httpsOnly = url => {
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}
const past = dt => new Date(dt) < new Date()

const makeICS = (event, series = []) => {
  const calUrl = event.cal ? new URL(event.cal) : null
  const location = calUrl?.searchParams.get('location') || ''

  const forCalendar = occurrence => ({ ...occurrence, location })

  const body = series.length
    ? buildCalendar(series.map(forCalendar))
    : buildCalendar([forCalendar(event)])

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`
}

const Page = ({ event, series = [] }) => {
  const venue = describeVenue(event.eventLink, event.eventLinkChannel)

  return (
    <>
      <Meta
        as={Head}
        name="Hack Club Events"
        title={event.title}
        description={`${event.ama ? 'An AMA hosted by' : 'An event by'} ${
          event.leader
        } on ${fullDate(event)} at Hack Club.`}
        image={`https://workshop-cards.hackclub.com/${encodeURIComponent(
          event.title
        )}.png?brand=Events&fontSize=225px&caption=${encodeURIComponent(
          `${event.leader} – ${fullDate(event)}`
        )}${event.amaAvatar && `&images=${event.amaAvatar}&theme=dark`}&images=${
          event.avatar
        }`}
      />
      <Box as="header" sx={{ bg: 'sheet' }}>
        <Container sx={{ textAlign: 'center', pt: [3, 4], pb: [3, 4] }}>
          <Heading as="h1" variant="title" sx={{ mb: 2 }}>
            {event.title}
          </Heading>
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              color: 'muted',
              fontSize: 2
            }}
          >
            <Text as="span">
              {event.ama ? 'An event hosted by' : 'An event by'}
            </Text>
            <Avatar
              src={event.avatar}
              alt={`${event.leader} profile picture`}
              size={36}
              sx={{ mx: 2, height: 36 }}
            />
            <Text as="span">{event.leader}</Text>
          </Flex>
        </Container>
      </Box>
      <Container
        as="article"
        sx={{
          maxWidth: [null, 'copy', 'copyPlus'],
          display: 'grid',
          gridGap: [3, 4],
          gridTemplateColumns: [null, 'auto 1fr'],
          alignItems: 'start',
          py: [3, 4]
        }}
      >
        <Box as="aside">
          <Box
            sx={{
              borderRadius: ['extra', 'ultra'],
              fontWeight: 'bold',
              textAlign: 'center',
              border: '4px solid',
              borderColor: past(event.end) ? 'muted' : 'primary',
              width: [96, 128]
            }}
          >
            <Box
              sx={{
                bg: past(event.end) ? 'muted' : 'primary',
                color: 'white',
                fontSize: [2, 3]
              }}
            >
              {tt('{MM}').render(new Date(event.start))}
            </Box>
            <Box
              sx={{
                color: past(event.end) ? 'muted' : 'text',
                fontSize: [4, 5, 6],
                lineHeight: 'subheading'
              }}
            >
              {tt('{DD}').render(new Date(event.start))}
            </Box>
          </Box>
          {event.amaAvatar && (
            <Avatar size={128} sx={{ mt: 4 }} src={event.amaAvatar} />
          )}
        </Box>
        <Box as="article">
          <Text variant="caption" sx={{ display: 'block' }}>
            {fullDate(event)}
          </Text>
          <Text variant="subtitle" sx={{ display: 'block' }}>
            {tt('{h}:{mm} {a}').render(new Date(event.start))}–
            {tt('{h}:{mm} {a}').render(new Date(event.end))}
          </Text>

          {venue && (
            <VenueLink
              url={event.eventLink}
              channel={event.eventLinkChannel}
              size={16}
              sx={{ display: 'inline-flex', mt: 1, color: 'muted' }}
            />
          )}

          {event.tags?.length > 0 && (
            <Flex sx={{ gap: 1, flexWrap: 'wrap', mb: [2, 3] }}>
              {event.tags.map(tag => (
                <Text
                  key={tag}
                  as="span"
                  sx={{
                    display: 'inline-block',
                    fontSize: 0,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    bg: 'sunken',
                    color: 'muted',
                    px: 2,
                    py: '2px',
                    borderRadius: 'default'
                  }}
                >
                  {tag.replace('-', ' ')}
                </Text>
              ))}
            </Flex>
          )}

          <SeriesDates dates={series} currentId={event.id} sx={{ mt: 3 }} />

          <EventDescription html={event.html} />

          {event.cancelled && (
            <Message variant="alert" sx={{ mb: [3, 4] }}>
              <Text as="span" sx={{ fontWeight: 'bold' }}>
                This event was cancelled.
              </Text>
              {event.cancellationReason && (
                <Text as="p" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {event.cancellationReason}
                </Text>
              )}
            </Message>
          )}

          {event.live && venue && (
            <Flex sx={{ gap: 2, flexWrap: 'wrap', mb: [3, 4] }}>
              <Button
                as="a"
                target="_blank"
                rel="noopener noreferrer"
                href={venue.href}
                sx={{ bg: 'green' }}
              >
                <Video />
                Join {venue.label}
              </Button>
            </Flex>
          )}

          {!past(event.start) && !event.cancelled && (
            <Flex sx={{ gap: 2, flexWrap: 'wrap', mb: [3, 4] }}>
              <Button
                as="a"
                target="_blank"
                href={httpsOnly(event.cal) || undefined}
                sx={{ bg: 'cyan' }}
              >
                <Calendar />
                Add to Google Calendar
              </Button>
              <Button
                as="a"
                href={makeICS(event, series)}
                download={`${event.slug}.ics`}
                sx={{ bg: 'blue' }}
              >
                <Download />
                Download .ics
              </Button>
            </Flex>
          )}
          { !event.ama && (
            event.rsvpFormUrl
              ? <ExternalRsvp event={event} />
              : <Rsvp event={event} />
          )}
        </Box>
      </Container>
      {event.ama && (
        <Box
          as="section"
          sx={
            past(event.start)
              ? {
                  bg: event.youtube ? 'dark' : 'background',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }
              : { bg: 'sunken' }
          }
          py={[4, 5]}
        >
          {past(event.start) || event.youtube ? (
            <>
              {event.youtube && (
                <Embed>
                  <ReactPlayer url={event.youtube} width="100%" height="100%" />
                </Embed>
              )}
              <Flex sx={{ justifyContent: 'center', px: 3, mt: [3, 4] }}>
                <Subscribe />
              </Flex>
            </>
          ) : null}
          {!past(event.start) && (
            <Container
              as="section"
              sx={{
                display: 'grid',
                gridTemplateColumns: [
                  null,
                  event.amaForm ? 'repeat(2, 1fr)' : null
                ],
                gridGap: [3, 4],
                maxWidth: 'copyPlus'
              }}
            >
              {event.amaForm ? <AMARsvp {...event} /> : ''}
              <Card sx={{ margin: event.amaForm ? 'default' : 'auto' }}>
                <Heading as="h2" variant="headline" mt={0}>
                  Not part of the{' '}
                  <Link href="https://hackclub.com/">Hack&nbsp;Club</Link> Slack?
                </Heading>
                <Text variant="subtitle" mb={[3, 4]}>
                  We’ll post the event recording to YouTube.
                </Text>
                <Subscribe />
              </Card>
            </Container>
          )}
        </Box>
      )}
    </>
  )
}

let emojisRecachedThisPageload = false
/**
 * Gets a full list of emojis from the Badger API.
 * Caches the result, and uses results from previous page loads but re-fetches in the background for future page loads.
 * This is necessary because we currently need to download _every_ emoji on each page load, which can take multiple seconds.
 * It would be nice if Badger could cache and only send emojis we need.
 */
let emojiCacheWritable = true

const cacheEmojis = data => {
  if (!emojiCacheWritable || !data) return
  try {
    localStorage.setItem('emojis', JSON.stringify(data))
  } catch {
    emojiCacheWritable = false
  }
}

const readCachedEmojis = () => {
  try {
    const cached = localStorage.getItem('emojis')
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

async function getEmojis(bypassCache = false) {
  if (!bypassCache) {
    const cached = readCachedEmojis()
    if (cached) {
      if (!emojisRecachedThisPageload && emojiCacheWritable) {
        emojisRecachedThisPageload = true
        setTimeout(async () => cacheEmojis(await getEmojis(true)), 500)
      }

      return cached
    }
  }

  try {
    const emojiData = await (
      await fetch('https://badger.hackclub.dev/api/emoji/')
    ).json()
    cacheEmojis(emojiData)
    return emojiData
  } catch (e) {
    console.error('Failed to fetch emojis:', e)
    return null
  }
}

/**
 * Renders the description of the event, replacing emoji shortcodes with actual images.
 * The description is stored as markdown and rendered to sanitised HTML on the server,
 * so we manipulate the result as a string here.
 */
const EventDescription = ({ html: initialHTML }) => {
  const [html, setHtml] = useState(initialHTML)

  const emojiRegex = /(:[^ .,;`\u2013~!@#$%^&*(){}=\\:"<>?|A-Z]+:)/g

  useEffect(() => {
    async function replaceEmoji() {
      const emojis = await getEmojis()
      if (!emojis) return

      setHtml(
        html.replace(emojiRegex, match => {
          const emojiName = match.slice(1, -1)
          const emojiURL = emojis[emojiName]

          if (!emojiURL || !emojiURL.startsWith('http')) return match
          return `<img src="${emojiURL}" alt="${emojiName}" style="height: 1em; vertical-align: text-bottom;" />`
        })
      )
    }
    replaceEmoji()
  }, [])

  return (
    <Text
      as={BaseStyles}
      sx={{ my: [2, 4], fontSize: [2, 3] }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const Embed = props => (
  <Box
    {...props}
    sx={{
      width: '100%',
      maxWidth: 'layout',
      height: 0,
      paddingBottom: 100 / (16 / 9) + '%',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'extra',
      boxShadow: 'card',
      px: 3,
      iframe: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        bottom: 0,
        left: 0,
        border: 0
      }
    }}
  />
)

const Subscribe = () => (
  <Button
    as="a"
    target="_blank"
    href="https://www.youtube.com/hackclubhq"
    sx={{ bg: 'red', color: 'white', mb: [3, 4] }}
  >
    <Youtube />
    Subscribe on YouTube
  </Button>
)

export default props => {
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Spinner size={64} color="primary" />
      </Box>
    )
  } else {
    return <Page {...props} />
  }
}

export const getStaticPaths = async () => {
  const events = await getPublicEvents()
  const slugs = map(events, 'slug')
  const paths = slugs.map(slug => ({ params: { slug } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const events = await getPublicEvents()
  const event = find(events, { slug })

  if (!event) return { notFound: true, revalidate: 2 }

  event.html = DOMPurify.sanitize(await parse(event.desc ?? ''))
  event.desc ??= null
  event.live = isHappeningNow(event)

  const series = event.seriesId
    ? events
        .filter(e => e.seriesId === event.seriesId)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .map(e => ({
          id: e.id,
          slug: e.slug,
          title: e.title ?? null,
          start: e.start,
          end: e.end,
          cancelled: e.cancelled || false,
          seriesId: e.seriesId ?? null,
          seriesRule: e.seriesRule ?? null,
          occurrenceStart: e.occurrenceStart ?? null
        }))
    : []

  return { props: { event, series }, revalidate: 2 }
}
