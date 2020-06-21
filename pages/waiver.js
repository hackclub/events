import { Container, Text, Heading, Button } from 'theme-ui'

export default () => {
  return (
    <Container as="article" sx={{ mt: 4 }} variant="copy">
      <Heading as="h1" variant="title">
        Thanks for RSVPing!
      </Heading>
      <Heading as="h2" sx={{ mb: 4 }} variant="subtitle">
        We’re really excited to have you.
      </Heading>

      <Text sx={{ fontSize: 2, mb: 2 }}>
        Since we livestream AMA calls publicly, we’ll need you to fill out a
        waiver first. Please make sure to use the same email address that you
        filled out the RSVP with.
      </Text>

      <Button
        as="a"
        target="_blank"
        href="https://hack.af/ama-waiver-u18"
        mr={3}
      >
        Waiver: Under 18
      </Button>

      <Button as="a" target="_blank" href="https://hack.af/ama-waiver-o18">
        Waiver: Over 18
      </Button>
    </Container>
  )
}
