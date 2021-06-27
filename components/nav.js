import { ArrowLeft, Moon, GitHub } from 'react-feather'
import { Box, Container, IconButton, Image, Link as A } from 'theme-ui'
import { useColorMode } from 'theme-ui'
import { useRouter } from 'next/router'
import Link from 'next/link'

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
  <Link href={to} passHref>
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


export default () => {
  const [mode] = useColorMode()
  const router = useRouter()
  const home = router.pathname === '/'
  return (
    <Box
      as="nav"
      sx={{
        bg: '#c44d4d',
        color: 'white',
        py: 3
      }}
    >
      <Container
        sx={{
          display: 'flex',
          alignItems: 'center',
          a: {
            fontSize: 1,
            color: 'white',
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
      </Container>
    </Box>
  )
}
