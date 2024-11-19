import { Container, Box, Heading } from 'theme-ui'
import Month from '../components/month'
import { getEvents } from '../lib/data'
import { filter, groupBy } from 'lodash'

export default ({ months }) => (
  <>
    <Box
      as="header"
      sx={{
        bg: 'sheet',
        color: 'primary',
        textAlign: 'center',
        py: [3, 4],
        px: 3,
        mb: [3, 4]
      }}
    >
      <Heading as="h1" variant="title">
        Past Events
      </Heading>
    </Box>
    <Container>
      {Object.keys(months)
        .reverse()
        .map(key => (
          <Month key={key} month={key} events={months[key]} />
        ))}
    </Container>
  </>
)

export const getStaticProps = async () => {
  let events = await getEvents()
  // Select events from past months
  events = filter(
    events,
    e =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) <
      new Date(new Date().toISOString().substring(0, 7))
  )
  let months = groupBy(events, e => e.start.substring(0, 7))

  Object.keys(months).forEach(
    (k, i) =>
      (months[k] = months[k].map(event => {
        return { ...event, desc: event.desc ?? null }
      }))
  )
  return { props: { months }, revalidate: 5 }
}
