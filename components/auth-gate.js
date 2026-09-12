import { Button, Container, Heading, Text } from 'theme-ui'

const AuthGate = ({ title, body, returnTo }) => (
  <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
    <Heading as="h1" variant="title" sx={{ mb: 2 }}>
      {title}
    </Heading>
    <Text as="p" variant="subtitle" sx={{ mb: [3, 4] }}>
      {body}
    </Text>
    <Button as="a" href={`/api/auth/login/?returnTo=${encodeURIComponent(returnTo)}`}>
      Sign in with Slack
    </Button>
  </Container>
)

export default AuthGate
