import Head from "next/head";
import Meta from "@hackclub/meta";
import { BaseStyles, Box, Container, Heading, Text, Link as A } from "theme-ui";
import { getEvents } from "../lib/data";
import { getSession, useSession } from "next-auth/react";
import Month from "../components/month";
import { groupBy } from 'lodash'


export default (props) => {
  const events = JSON.parse(props.events);
  const upcomingEvents = events.filter((event) => new Date(event.start) > new Date());
  
  // Organise events by month
  let groupedEvents = events;

  groupedEvents = groupBy(groupedEvents, e => e.start?.substring(0, 7));
  groupedEvents = Object.entries(groupedEvents).reverse().reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
  console.log(groupedEvents)
  
  return (
  <>
    <Meta
      as={Head}
      name="Hack Club Events"
      description="Your Events"
      image="https://events.hackclub.com/card.png"
    />
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
        Your Events
      </Heading>
      <Text as="p" variant="subtitle">
        These are events that you have scheduled. You can manage them here.
      </Text>
      <Text as="p" variant="subtitle" mt={2}>
        All dates/times in your local time.
      </Text>
    </Box>
    <Container as="main" px={0}>
      {Object.keys(groupedEvents).map(key => (
        <Month key={key} month={key} events={groupedEvents[key]} />
      ))}
    </Container>
  </>
)
}

export const getServerSideProps = async (context) => {
  const events = await getEvents();
  const session = await getSession(context.req);
  const id = session?.user?.id;
  const userEvents = events.filter((event) => event.leaderSlackId === id);
  const stringEvents = JSON.stringify(userEvents);
  
  return {
    props: {
      events: stringEvents
    }
  }
}