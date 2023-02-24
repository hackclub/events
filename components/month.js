import { Heading, Text, Grid, Container } from 'theme-ui'
import { format } from 'date-fns'
import Event from './event'

export default ({ month, events }) => (
  <>
    <Heading variant="headline" sx={{ color: 'accent', px: 3, m: 0, mt: 3 }}>
      {format(new Date(`${month}-02`), 'MMMM yyyy')}
    </Heading>
    {events.filter(
      event =>
        new Date(event.start) > new Date() ||
        new Date(event.end) > new Date()
    ).length > 0 ? (
      <Text as="p" variant="subtitle" mb={2} mt={2} ml={3}>
        Upcoming Events
      </Text>
    ) : null}

    <Grid columns={[1, 2, 3]} sx={{ mt: 0, mb: 0, ml: 3, mr: 3, p: 0 }}>
      {events
        .filter(
          event =>
            new Date(event.start) > new Date() ||
            new Date(event.end) > new Date()
        )
        .map(event => (
          <Event {...event} key={event.id} />
        ))}
    </Grid>

    <Text as="p" variant="subtitle" mb={2} mt={3} ml={3} mr={3}>
    {events.filter(
      event =>
        new Date(event.start) > new Date() ||
        new Date(event.end) > new Date()
    ).length > 0 ? (
      <Text as="p" variant="subtitle" mb={2} mt={2}>
        Past Events
      </Text>
    ) : null}
    </Text>
    <Grid columns={[1, 2, 3]} sx={{ mt: 0, ml: 3, mr: 3 }}>
      {events
        .filter(event => new Date(event.end) < new Date())
        .map(event => (
          <Event {...event} key={event.id} />
        ))}
    </Grid>
  </>
)
