import { Box, Text, Flex, Avatar, Heading } from 'theme-ui'
import tt from 'tinytime'
import Link from 'next/link'
import Sparkles from './sparkles'
import { XCircle, Users } from 'react-feather'

const past = dt => new Date(dt) < new Date()
const now = (start, end) =>
  new Date() > new Date(start) && new Date() < new Date(end)

const tagStyle = {
  display: 'inline-block',
  fontSize: 0,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  bg: 'sunken',
  color: 'muted',
  px: 2,
  py: '2px',
  borderRadius: 'default',
  mr: 1,
  mt: 1
}

const cancelledStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: 0,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05rem',
  bg: 'red',
  color: 'white',
  px: 2,
  py: '2px',
  borderRadius: 'default',
  mr: 1,
  mt: 1
}

const Event = ({
  id,
  slug,
  title,
  desc,
  leader,
  avatar,
  cancelled,
  interestCount,
  start,
  end,
  cal,
  tags
}) => (
  <Link href={`/${slug}`} passHref legacyBehavior>
    <Box
      as="a"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        textDecoration: 'none',
        bg: 'elevated',
        color: 'text',
        p: [3, 3],
        opacity: cancelled ? 0.75 : 1,
        transition: 'opacity 0.2s ease',
        height: '100%'
      }}
    >
      <Box
        sx={{
          bg: cancelled ? 'muted' : past(end) ? 'sunken' : 'primary',
          color: past(end) ? 'text' : 'white',
          lineHeight: ['subheading', 'body'],
          m: -3,
          py: 2,
          px: 3,
          mb: 3,
          strong: {
            display: ['block', 'inline'],
            textDecoration: cancelled ? 'line-through' : 'none'
          }
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
      {cancelled && (
        <Box>
          <Text as="span" sx={cancelledStyle}>
            {' '}
            <XCircle size={14} />
            Cancelled
          </Text>
        </Box>
      )}
      {tags?.length > 0 && (
        <Box sx={{ mb: 1 }}>
          {tags.map(tag => (
            <Text as="span" key={tag} sx={tagStyle}>
              {tag.replace('-', ' ')}
            </Text>
          ))}
        </Box>
      )}
      <Box sx={{ flex: '1 1 auto' }} />
      <Flex
        sx={{
          alignItems: 'center',
          color: 'muted'
        }}
      >
        {now(start, end)}
        {!avatar.includes('emoji') && (
          <Avatar
            src={avatar}
            alt={`${leader} profile picture`}
            size={24}
            sx={{ height: 24, mr: 2 }}
          />
        )}
        <Text as="span">{leader}</Text>
        {interestCount > 0 && (
          <Text
            as="span"
            sx={{
              ml: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 0,
              fontWeight: 'bold',
              bg: 'sunken',
              color: 'muted',
              px: 2,
              py: '2px',
              borderRadius: 'default'
            }}
          >
            <Users size={14} /> {interestCount}
          </Text>
        )}
      </Flex>
      {now(start, end) && !cancelled && (
        <Sparkles
          aria-hidden
          style={{
            pointerEvents: 'none',
            position: 'absolute !important',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      )}
    </Box>
  </Link>
)

export default Event
