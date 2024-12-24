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
import { Calendar, Youtube } from 'react-feather'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import tt from 'tinytime'
import YouTubePlayer from 'react-player/youtube'
import { useState, useEffect } from 'react'

import AMARsvp from '../components/ama-rsvp'
import { getEvents, getUsers } from '../lib/data'
import { find, map } from 'lodash'
import { parse } from 'marked'
import { useSession } from 'next-auth/react'

const fullDate = event => tt('{MM} {DD}, {YYYY}').render(new Date(event.start))
const past = dt => new Date(dt) < new Date()

const Page = ({ event }) => {
  const { data: session } = useSession()
  const [interested, setInterested] = useState(false)
  const userId = session?.user?.id || ''
  const ownEvent = event.leaderSlackId === userId
  const interestedUsers = event.interestedUsers || []
  getUsers().then(users => {
    const userAirtableId = users.find(user => user.fields['Slack ID'] === userId)?.id;
    setInterested(interestedUsers.includes(userAirtableId));
  })
  
  return (
    <>
      <Meta
        as={Head}
        name="Hack Club Events"
        title={event.title}
        description={`${event.ama ? 'An AMA hosted by' : 'An event by'} ${event.leader
          } on ${fullDate(event)} at Hack Club.`}
        image={`https://workshop-cards.hackclub.com/${encodeURIComponent(
          event.title
        )}.png?brand=Events&fontSize=225px&caption=${encodeURIComponent(
          `${event.leader} – ${fullDate(event)}`
        )}${event.amaAvatar && `&images=${event.amaAvatar}&theme=dark`}&images=${event.avatar
          }`}
      />
      <Box as="header" sx={{ bg: 'sheet' }}>
        <Container sx={{ textAlign: 'center', pt: [3, 4], pb: [3, 4] }}>
          <Heading as="h1" variant="title" sx={{ mb: 2 }}>
            {event.title} - {interested ? 'Interested' : 'Not Interested'}
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
            <Text as="span">{event.leader} {ownEvent && '(you!)'}</Text>
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

          <EventDescription html={event.html} />

          {!past(event.start) && (
            <Box
              sx={{
                display: 'flex',
                gridGap: [3, 4],
                alignItems: 'center'
              }}
            >

              <Button
                as="a"
                target="_blank"
                href={event.cal}
                sx={{ bg: 'cyan', mb: [3, 4] }}
              >
                <Calendar />
                Add to Google Calendar
              </Button>
              <Button
                as="a"
                target="_blank"
                href={event.eventLink}
                sx={{ bg: 'green', mb: [3, 4] }}
              >
                RSVP
              </Button>
            </Box>
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
                  <YouTubePlayer url={event.youtube} />
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
async function getEmojis(bypassCache = false) {
  if (!bypassCache) {
    const cached = localStorage.getItem('emojis')
    if (cached) {
      if (!emojisRecachedThisPageload) {
        emojisRecachedThisPageload = true
        setTimeout(
          async () =>
            localStorage.setItem(
              'emojis',
              JSON.stringify(await getEmojis(true))
            ),
          500
        )
      }

      return JSON.parse(cached)
    }
  }

  try {
    const emojiData = await (
      await fetch('https://badger.hackclub.dev/api/emoji/')
    ).json()
    localStorage.setItem('emojis', JSON.stringify(emojiData))
    return emojiData
  } catch (e) {
    console.error('Failed to fetch emojis:', e)
    return null
  }
}

/**
 * Renders the description of the event, replacing emoji shortcodes with actual images.
 * The event description is currently stored as HTML, so we manipulate it as a string directly.
 * This isn't an ideal solution, though; it may be better to store the description as Markdown,
 * especially considering we don't use any HTML-specific features at the moment.
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
  const events = await getEvents()
  const slugs = map(events, 'slug')
  const paths = slugs.map(slug => ({ params: { slug } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const events = await getEvents()
  const event = find(events, { slug })
  event.html = await parse(event.desc)
  event.desc ??= null
  return { props: { event }, revalidate: 2 }
}
