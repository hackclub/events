import { Container, Box, Text, Heading, Button, Link as A } from 'theme-ui'
import Link from 'next/link'
import Month from '../components/month'
import { Activity, SkipBack } from 'react-feather'
import { getUpcomingMonthly } from './api/events/upcoming-monthly'

export default ({ months }) => (
  <>
    <Box
      as="header"
      sx={{
        bg: 'sheet',
        textAlign: 'center',
        px: 3,
        pb: [3, 4],
        mb: [3, 4]
      }}
    >
      <Heading as="h1" variant="title" color="primary" mb={2}>
        Hack Club Events
      </Heading>
      <Text as="p" variant="subtitle">
        AMAs, show & tells, & weekly fun in the{' '}
        <A href="https://hackclub.com/">Hack Club</A> community.
      </Text>
      <Text as="p" variant="subtitle" mt={2}>
        All dates/times in your local time.
      </Text>
    </Box>
    <Container as="main" px={0}>
      {Object.keys(months).map(key => (
        <Month key={key} month={key} events={months[key]} />
      ))}
      {Object.keys(months).length == 0 && (
        <Box sx={{ textAlign: 'center' }}>
          <h1 sx={{ fontWeight: '400' }}>🚧 More events coming soon.</h1>
        </Box>
      )}
      <Box
        as="footer"
        sx={{
          textAlign: 'center',
          pb: [4, 5]
        }}
      >
        <Link href="/past">
          <Button variant="outline" sx={{ color: 'secondary', mx: 2 }}>
            <SkipBack />
            View past events
          </Button>
        </Link>
        <Link href="/data">
          <Button variant="outline" sx={{ color: 'secondary', mx: 2 }}>
            <Activity />
            Events API
          </Button>
        </Link>
      </Box>
    </Container>
  </>
)

export const getStaticProps = async () => {
  const months = await getUpcomingMonthly()
  return { props: { months }, revalidate: 1 }
}
