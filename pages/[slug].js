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

// import RSVP from '../components/rsvp'
import AMARsvp from '../components/ama-rsvp'

const fullDate = event => tt('{MM} {DD}, {YYYY}').render(new Date(event.start))
const past = dt => new Date(dt) < new Date()

const Page = ({ event }) => (
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
      <Container sx={{ textAlign: 'left', pt: [3, 4], pb: [3, 4] }}>
        <Heading as="h1" variant="title" sx={{ mb: 2, color: 'white' }}>
          {event.title}
        </Heading>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'left',
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
    <Container>
      <Container
        as="article"
        sx={{
          maxWidth: [null, 'copy', 'copyPlus'],
          display: 'grid',
          margin: 'none',
          ml: '0px',
          gridGap: [3, 4],
          gridTemplateColumns: [null, '1fr auto'],
          alignItems: 'start',
          py: [3, 4],
          px: 0
        }}
      >
        <Box as="article" sx={{ gridRow: [2, 1], gridColumn: 1 }}>
          <Text variant="caption">{fullDate(event)}</Text>
          <Text variant="subtitle">
            {tt('{h}:{mm} {a}').render(new Date(event.start))} –{' '}
            {tt('{h}:{mm} {a}').render(new Date(event.end))}
          </Text>
          <Box
            as={BaseStyles}
            sx={{ my: [2, 3], fontSize: [2, 3] }}
            dangerouslySetInnerHTML={{ __html: event.html }}
          />
          {!past(event.start) && (
            <Button
              as="a"
              target="_blank"
              href={event.cal}
              sx={{ bg: 'primary', mb: [3, 4], display: 'flex', width: 'max-content' }}
            >
              <Calendar />
              <Text ml={2}>Add to Google Calendar</Text>
            </Button>
          )}
          {/* !event.ama && <RSVP {...event} /> */}
        </Box>
        <Box>
          <Box
            sx={{
              borderRadius: ['extra', 'ultra'],
              fontWeight: 'bold',
              textAlign: 'center',
              border: '4px solid',
              borderColor: 'sheet',
              width: [96, 128]
            }}
          >
            <Box
              sx={{
                bg: 'sheet',
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
      </Container>
    </Container>
    {event.ama && (
      <Container as="section" py={[2, 2]}>
        {past(event.start) || event.youtube ? (
          <>
            {event.youtube && (
              <Embed>
                <YouTubePlayer url={event.youtube} />
              </Embed>
            )}
            <Flex sx={{ justifyContent: 'left', mt: event.youtube ? [3, 4] : 0 }}>
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
      </Container>
    )}
  </>
)

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
    sx={{ bg: 'red', color: 'white', mb: [3, 4], display: 'flex' }}
  >
    <Youtube />
    <Text as="span" ml={2}>
      Subscribe on YouTube
    </Text>
  </Button>
)

export default function App(props) {
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
  const { getEvents } = require('../lib/data')
  const { map } = require('lodash')
  const events = await getEvents()
  const slugs = map(events, 'slug')
  const paths = slugs.map(slug => ({ params: { slug } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const md = require('@hackclub/markdown')
  const { slug } = params
  const { getEvents } = require('../lib/data')
  const { find } = require('lodash')
  const events = await getEvents()
  const event = find(events, { slug })
  event.html = await md(event.desc)
  return { props: { event }, revalidate: 2 }
}
