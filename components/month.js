import { Heading, Grid } from 'theme-ui'
import { format } from 'date-fns'
import Event from './event'

export default ({ month, events }) => (
  <>
    <Heading variant="headline" sx={{ color: 'accent', mt: [3, 4] }}>
      {format(new Date(`${month}-02`), 'MMMM yyyy')}
    </Heading>
    <Grid columns={[null, 2, 4]} gap={[3, 4]} sx={{ mb: [3, 4, 5] }}>
      {events.map((event) => (
        <Event {...event} key={event.id} />
      ))}
    </Grid>
  </>
)
