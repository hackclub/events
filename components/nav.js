import { ArrowLeft, Moon, GitHub } from 'react-feather'
import { Box, Container, IconButton, Image, Link as A, Avatar, Flex } from 'theme-ui'
import { useColorMode } from 'theme-ui'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const NavButton = ({ sx, ...props }) => (
  <IconButton
    {...props}
    sx={{
      color: 'primary',
      borderRadius: 'circle',
      transition: 'box-shadow .125s ease-in-out',
      ':hover,:focus': {
        boxShadow: '0 0 0 2px',
        outline: 'none'
      },
      ...sx
    }}
  />
)

const BackButton = ({ to = '/', text = 'All Events' }) => (
  <Link href={to}>
    <NavButton
      title={to === '/' ? 'Back to homepage' : 'Back'}
      sx={{ display: 'flex', width: 'auto', pr: 2 }}
    >
      <ArrowLeft />
      {text}
    </NavButton>
  </Link>
)

const Flag = () => (
  <A
    href="https://hackclub.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Hack Club homepage"
    sx={{ mt: -3, lineHeight: 0 }}
  >
    <Image
      src="https://assets.hackclub.com/flag-orpheus-top.svg"
      alt="Hack Club flag"
      sx={{ width: [96, 128] }}
    />
  </A>
)

const ColorSwitcher = props => {
  const [mode, setMode] = useColorMode()
  return (
    <NavButton
      {...props}
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      title="Reverse color scheme"
    >
      <Moon size={24} />
    </NavButton>
  )
}

export default () => {
  const [mode] = useColorMode()
  const router = useRouter()

  const [session, setSession] = useState(null)
  useEffect(() => {
    fetch('/api/auth/me')
    .then(r => r.json())
    .then(data => setSession(data))
    .catch(() => setSession({ slackId: null }))
  }, [])

  const home = router.pathname === '/'
  return (
    <Box
      as="nav"
      sx={{
        bg: 'sheet',
        color: 'nav',
        py: 3
      }}
    >
      <Container
        sx={{
          display: 'flex',
          alignItems: 'center',
          a: {
            fontSize: 1,
            color: 'primary',
            textDecoration: 'none',
            mr: [3, 4]
          }
        }}
      >
        {!home ? <BackButton /> : <Flag />}
        <NavButton
          as="a"
          href="https://github.com/hackclub/events"
          aria-label="View source code on GitHub"
          sx={{ ml: 'auto' }}
        >
          <GitHub size={24} />
        </NavButton>
        <ColorSwitcher />
        {session?.slackId ? (
          <Flex sx={{alignItems: 'center', gap: 2, ml: 2}}>
            <NavButton
              as="a"
              href="/api/auth/logout/"
              sx={{ fontSize: 1, width: 'auto', px: 2 }}
            >
              Sign Out
            </NavButton>
            <Avatar
              src={`https://cachet.dunkirk.sh/users/${session.slackId}/r`}
              alt="Your Slack Avatar"
              size={28}
              sx={{hieght:28, width:28, borderRadius:'circle'}}
            />
          </Flex>
        ): session != null ? (
          <NavButton
            as="a"
            href={`/api/auth/login/?returnTo=${encodeURIComponent(router.asPath)}`}
            sx={{ml:2,fontSize:1,width:'auto',px:2}}
          >
            Log in
          </NavButton>
        ): null}
      </Container>
    </Box>
  )
}
