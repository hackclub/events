import { Container, Box, Heading } from 'theme-ui'
import Month from '../components/month'
import { getEvents } from '../lib/data'
import { byMonth, past } from '../lib/calendar'

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
  const months = byMonth(past(await getEvents()))

  // getStaticProps cannot serialise undefined.
  Object.keys(months).forEach(key => {
    months[key] = months[key].map(event => ({
      ...event,
      desc: event.desc ?? null
    }))
  })

  return { props: { months }, revalidate: 5 }
}
