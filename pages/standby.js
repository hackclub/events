import { useEffect } from 'react'
import { keyframes } from '@emotion/core'
import {
  Box,
  Container,
  Alert,
  Heading,
  Text,
  Avatar,
  useThemeUI
} from 'theme-ui'
import theme from '@hackclub/theme'
import fetch from 'isomorphic-unfetch'

const glow = keyframes({
  '0%': { opacity: 0, boxShadow: '0 0 2px currentColor' },
  '50%': { opacity: 1, boxShadow: '0 0 8px currentColor' },
  '100%': { opacity: 0, boxShadow: '0 0 2px currentColor' }
})

export default () => {
  useEffect(() => {
    const check = setInterval(async () => {
      let res = await fetch('api/redirect').then((res) => res.json())

      if (res.redirect == null) {
        console.log('not yet!')
        return
      }

      window.location.href = res.redirect
    }, 500)
    return clearInterval(check)
  }, [])
  const { colorMode } = useThemeUI()
  const bg = colorMode === 'dark' ? 'dark' : 'cyan'
  const color = colorMode === 'dark' ? 'yellow' : 'white'
  return (
    <Box as="main" sx={{ bg, flex: '1 1 auto' }}>
      <style>{`#__next{display:flex;flex-direction:column;min-height:100vh;}`}</style>
      <Container variant="narrow" sx={{ py: [3, 4, 5], textAlign: 'center' }}>
        <Avatar
          size={128}
          src="https://dl.airtable.com/.attachmentThumbnails/42a5948c801c6f23d346807b9427faaa/2652e019"
          alt="Jack Conte"
        />
        <Text
          variant="headline"
          sx={{ color: 'primary', textTransform: 'uppercase', mb: 3 }}
        >
          Hack Club
        </Text>
        <Heading as="h1" variant="title" color="white">
          AMA with Jack&nbsp;Conte
        </Heading>
        <Box
          sx={{
            border: '4px dashed',
            borderColor: color,
            borderRadius: 'ultra',
            color,
            p: [3, 4],
            bg,
            mt: 4
          }}
        >
          <Text
            as="p"
            variant="headline"
            sx={{
              fontSize: [3, 4],
              my: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              as="span"
              sx={{
                bg: 'red',
                color: 'red',
                display: 'inline-block',
                width: 20,
                height: 20,
                borderRadius: 'circle',
                mr: 3,
                animation: `${glow} 1.5s infinite linear`
              }}
            />
            <span>Please stand by…</span>
          </Text>
          <Text
            as="p"
            fontSize={[2, 3]}
            sx={{ lineHeight: 'caption' }}
            mt={[2, 3]}
          >
            You will be redirected when the event begins.
          </Text>
        </Box>
      </Container>
    </Box>
  )
}
