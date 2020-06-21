import { Card, Container, Text, Heading, Button } from 'theme-ui'

export default () => (
  <Card
    as="article"
    sx={{ my: 4, textAlign: 'center', variant: 'layout.copy' }}
  >
    <Heading as="h1" variant="title" color="red">
      Thanks for RSVPing!
    </Heading>

    <Text as="p" variant="subtitle" mt={2}>
      We’re really excited to have you.
    </Text>

    <Text sx={{ fontSize: 2, my: 4 }}>
      Since we livestream AMAs publicly, we’ll need you to fill out a waiver.
      Make&nbsp;sure to use the same email address you filled out the RSVP with.
    </Text>

    <Heading as="h2" variant="headline">
      Sign your waiver
    </Heading>

    <Button
      as="a"
      target="_blank"
      href="https://hack.af/ama-waiver-u18"
      bg="accent"
      mr={3}
    >
      I’m under 18
    </Button>

    <Button as="a" target="_blank" href="https://hack.af/ama-waiver-o18">
      I’m over 18
    </Button>
  </Card>
)
