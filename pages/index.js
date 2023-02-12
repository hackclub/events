import { Container, Box, Text, Heading, Button, Link as A } from 'theme-ui'
import Link from 'next/link'
import Month from '../components/month'
import { Activity, SkipBack, XCircle } from 'react-feather'
import { useState } from 'react'
export default ({ pastMonths, futureMonths }) => {
  const [allMonthsViewable, setAllMonthsViewable] = useState(false)

  return (
    <>
      <Box
        as="header"
        sx={{
          bg: 'sheet',
          textAlign: ['left', 'left', 'center'],
          px: 3,
          pb: [3, 4],
          mb: [3, 4]
        }}
      >
        <Container>
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
        </Container>
      </Box>

      <Container
        as="main"
        sx={{
          textAlign: 'left',
          pb: [3, 4]
        }}
        px={0}
      >
        {Object.keys(futureMonths).map(key => (
          <Month key={key} month={key} events={futureMonths[key]} />
        ))}
      </Container>
      {allMonthsViewable ? (
        <Container
          as="main"
          sx={{
            textAlign: 'left',
            pb: [3, 4]
          }}
          px={0}
        >
          {Object.keys(pastMonths).map(key => (
            <Month key={key} month={key} events={pastMonths[key]} />
          ))}
        </Container>
      ) : null}
      <Container>
        <Button
          as="a"
          onClick={() => setAllMonthsViewable(!allMonthsViewable)}
          variant="outline"
        >
          {!allMonthsViewable ? <SkipBack /> : <XCircle />}
          {!allMonthsViewable ? 'View Past Months' : 'Hide Past Months'}
        </Button>
        <Link href="/data" passHref>
          <Button as="a">
            <Activity />
            Events API
          </Button>
        </Link>
        <Box
          as="footer"
          sx={{
            textAlign: 'center',
            pb: [4, 5],
            a: { variant: 'buttons.outline', color: 'secondary', mx: 2 }
          }}
        ></Box>{' '}
      </Container>
    </>
  )
}

export const getStaticProps = async () => {
  const { getEvents } = require('../lib/data')
  const { groupBy, filter } = require('lodash')
  let events = await getEvents()
  let pastEvents = filter(
    events,
    e =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) <
      new Date(new Date().toISOString().substring(0, 7))
  )
  let futureEvents = filter(
    events,
    e =>
      new Date(new Date(e.end.substring(0, 7)).toISOString().substring(0, 7)) >=
      new Date(new Date().toISOString().substring(0, 7))
  )
  const pastMonths = groupBy(pastEvents, e => e.start.substring(0, 7))

  const futureMonths = groupBy(futureEvents, e => e.start.substring(0, 7))
  return { props: { pastMonths, futureMonths }, revalidate: 5 }
}
