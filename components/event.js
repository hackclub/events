import { Card, Box, Text, Flex, Avatar, Heading } from 'theme-ui'
import tt from 'tinytime'
import Link from 'next/link'

const past = (dt) => new Date(dt) < new Date()

const Event = ({ id, slug, title, desc, leader, avatar, start, end, cal }) => (
  <Link href="/[slug]" as={`/${slug}`} passHref>
    <Card as="a" sx={{ textDecoration: 'none', p: [2, 3] }}>
      <Box
        sx={{
          bg: past(start) ? 'muted' : 'primary',
          color: 'white',
          m: [-2, -3],
          py: [1, 2],
          px: [2, 3],
          mb: [2, 3]
        }}
      >
        <Text>
          <strong>{tt('{MM} {Do}').render(new Date(start))}</strong>{' '}
          {tt('{h}:{mm}').render(new Date(start))}–
          {tt('{h}:{mm} {a}').render(new Date(end))}
        </Text>
      </Box>
      <Heading variant="subheadline" sx={{ mt: 0, mb: 1 }}>
        {title}
      </Heading>
      <Flex
        sx={{
          alignItems: 'center',
          color: 'muted'
        }}
      >
        <Avatar
          src={avatar}
          alt={`${leader} profile picture`}
          size={24}
          sx={{ mr: 2 }}
        />
        <Text as="span">{leader}</Text>
      </Flex>
    </Card>
  </Link>
)

export default Event
