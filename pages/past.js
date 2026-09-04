import { Container, Box, Heading } from 'theme-ui'
import Month from '../components/month'
import { getEvents } from '../lib/data'
import { byMonth, past } from '../lib/calendar'
import { toCard } from '../lib/event-card'
import { mapValues } from 'lodash'

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
  const months = mapValues(byMonth(past(await getEvents())), events =>
    events.map(toCard)
  )

  return { props: { months }, revalidate: 5 }
}
