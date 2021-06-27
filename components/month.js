import { Heading, Grid } from 'theme-ui'
import { format } from 'date-fns'
import Event from './event'

export default ({ month, events }) => (
  <>
    <Heading variant="headline" sx={{ color: 'accent', px: 3, mt: [3, 4] }}>
      {format(new Date(`${month}-02`), 'MMMM yyyy')}
    </Heading>
    <Grid
      columns={[2, 3, 4]}
      gap="0px"
      sx={{
        bg: 'sunken',
        borderRadius: 'extra',
        overflow: 'hidden',
        boxShadow: 'elevated',
        mb: [3, 4, 5]
      }}
    >
      {events.map((event, index) => (
        <Event {...event} key={event.id} index={index} />
      ))}
    </Grid>
  </>
)
