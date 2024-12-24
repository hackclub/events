import { ArrowLeft, Moon, GitHub, LogIn } from 'react-feather'
import { Box, Container, IconButton, Image, Link as A } from 'theme-ui'
import { useColorMode } from 'theme-ui'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'

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
  <Link href={to} passHref legacyBehavior>
    <NavButton
      as="a"
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
  const {data: session} = useSession()
  const [mode] = useColorMode()
  const router = useRouter()
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
          sx={{ ml: 'auto', mr: 3 }}
        >
          <GitHub size={24} />
        </NavButton>
        <ColorSwitcher />
        {session ? (
          <img src={session.user.image} alt={session.user.name} style={{borderRadius: '50%', height: '24px', width: '24px', marginLeft: '32px'}} />
        ) : (
          <NavButton
          as="button"
          onClick={() => signIn('slack', { callbackUrl: '/dashboard', team: 'T0266FRGM' })}
          aria-label="Sign in"
          sx={{ ml: 3 }}
          >
        <LogIn size={24} />
          </NavButton>
        )}
      </Container>
    </Box>
  )
}
