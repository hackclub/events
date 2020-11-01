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
import { Calendar, Twitch, Youtube } from 'react-feather'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import tt from 'tinytime'
import TwitchPlayer from 'react-player/twitch'
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
        <Text variant="caption">{fullDate(event)}</Text>
        <Text variant="subtitle">
          {tt('{h}:{mm} {a}').render(new Date(event.start))}–
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
            sx={{ bg: 'cyan', mb: [3, 4] }}
          >
            <Calendar />
            Add to Google Calendar
          </Button>
        )}
        {/* !event.ama && <RSVP {...event} /> */}
      </Box>
    </Container>
    {event.ama && (
      <Box
        as="section"
        sx={
          past(event.start)
            ? {
                bg: !past(event.end) || event.youtube ? 'dark' : 'background',
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
            {past(event.end) && event.youtube && (
              <Embed>
                <YouTubePlayer url={event.youtube} />
              </Embed>
            )}
            {!past(event.end) && (
              <Embed>
                <TwitchPlayer url="https://twitch.tv/HackClubHQ" />
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
              gridTemplateColumns: [null, 'repeat(2, 1fr)'],
              gridGap: [3, 4],
              maxWidth: 'copyPlus'
            }}
          >
            <AMARsvp {...event} />
            <Card>
              <Heading as="h2" variant="headline" mt={0}>
                Not part of the{' '}
                <Link href="https://hackclub.com/">Hack&nbsp;Club</Link> Slack?
              </Heading>
              <Text variant="subtitle" mb={[3, 4]}>
                We’ll livestream the event on Twitch & YouTube.
              </Text>
              <Subscribe />
            </Card>
          </Container>
        )}
      </Box>
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
  <>
    <Button
      as="a"
      target="_blank"
      href="https://www.twitch.tv/HackClubHQ"
      sx={{ bg: '#9147ff', color: 'white', mr: 3, mb: [3, 4] }}
    >
      <Twitch />
      Follow on Twitch
    </Button>
    <Button
      as="a"
      target="_blank"
      href="https://www.youtube.com/hackclubhq"
      sx={{ bg: 'red', color: 'white', mb: [3, 4] }}
    >
      <Youtube />
      Subscribe on YouTube
    </Button>
  </>
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
