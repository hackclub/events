import { Container, Card, Box, Text, Heading, Grid } from 'theme-ui'
import tt from 'tinytime'
import { format } from 'date-fns'
import Event from '../components/event'

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
        Hack Club Events
      </Heading>
    </Box>
    <Container>
      {Object.keys(months).map((key) => (
        <>
          <Heading variant="headline" sx={{ color: 'accent', mt: [3, 4] }}>
            {format(new Date(`${key}-02`), 'MMMM yyyy')}
          </Heading>
          <Grid columns={[null, 2, 4]} gap={[3, 4]} sx={{ mb: [3, 4, 5] }}>
            {months[key].map((event) => (
              <Event {...event} key={event.id} />
            ))}
          </Grid>
        </>
      ))}
    </Container>
  </>
)

export const getStaticProps = async () => {
  const { getEvents } = require('../lib/data')
  const { groupBy, filter } = require('lodash')
  let events = await getEvents()
  // Filter out events from previous months
  events = filter(
    events,
    (e) =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) >=
      new Date(new Date().toISOString().substring(0, 7))
  )
  const months = groupBy(events, (e) => e.start.substring(0, 7))
  return { props: { months } }
}
