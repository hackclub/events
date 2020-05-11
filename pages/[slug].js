import { Avatar, Box, Button, Container, Flex, Heading, Text } from 'theme-ui'
import { Calendar } from 'react-feather'
import Head from 'next/head'
import Meta from '../components/meta'
import tt from 'tinytime'

import RSVP from '../components/rsvp'
import AMARsvp from '../components/ama-rsvp'

const fullDate = (event) =>
  tt('{MM} {DD}, {YYYY}').render(new Date(event.start))

export default ({ event }) => (
  <>
    <Meta
      as={Head}
      title={event.title}
      description={`${event.ama ? 'An event hosted by' : 'An event by'} ${
        event.leader
      } on ${fullDate(event)} at Hack Club.`}
      image={`https://workshop-cards.hackclub.com/${encodeURIComponent(
        event.title
      )}.png?brand=Events&caption=${encodeURIComponent(
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
            borderColor: 'primary',
            width: [96, 128]
          }}
        >
          <Box sx={{ bg: 'primary', color: 'white', fontSize: [2, 3] }}>
            {tt('{MM}').render(new Date(event.start))}
          </Box>
          <Box
            sx={{
              color: 'text',
              fontSize: [4, 5, 6],
              lineHeight: 'subheading'
            }}
          >
            {tt('{DD}').render(new Date(event.start))}
          </Box>
        </Box>
        {event.amaAvatar && (
          <Avatar size={128} sx={{ mt: 4 }} src={event.amaAvatar}></Avatar>
        )}
      </Box>
      <Box as="article">
        <Text variant="caption">{fullDate(event)}</Text>
        <Text variant="subtitle">
          {tt('{h}:{mm} {a}').render(new Date(event.start))}–
          {tt('{h}:{mm} {a}').render(new Date(event.end))}
        </Text>
        <Text sx={{ my: [2, 3], fontSize: [2, 3] }}>{event.desc}</Text>
        <Button
          as="a"
          target="_blank"
          href={event.cal}
          sx={{ bg: 'cyan', mb: [3, 4] }}
        >
          <Calendar />
          Add to Google Calendar
        </Button>
        {event.ama ? <AMARsvp {...event} /> : <RSVP {...event} />}
      </Box>
    </Container>
  </>
)

export const getStaticPaths = async () => {
  const { getEvents } = require('../lib/data')
  const { map } = require('lodash')
  const events = await getEvents()
  const slugs = map(events, 'slug')
  const paths = slugs.map((slug) => ({ params: { slug } }))
  return { paths, fallback: false }
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const { getEvents } = require('../lib/data')
  const { find } = require('lodash')
  const events = await getEvents()
  const event = find(events, { slug })
  return { props: { event }, unstable_revalidate: 2 }
}
