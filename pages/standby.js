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

const data = {
  first: 'Simone',
  last: 'Giertz',
  avatar: 'https://cdn.glitch.com/a4a6870f-4bcd-4112-ac0b-7592a8d488ab%2F2020-05-04_avatar.jpeg?v=1588619417108',
  bg: 'https://cdn.glitch.com/a4a6870f-4bcd-4112-ac0b-7592a8d488ab%2F2020-05-04_img.jpeg?v=1588619256468'
}
data.name = `${data.first} ${data.last}`

const glow = keyframes({
  '0%': { opacity: 0, boxShadow: '0 0 2px currentColor' },
  '50%': { opacity: 1, boxShadow: '0 0 8px currentColor' },
  '100%': { opacity: 0, boxShadow: '0 0 2px currentColor' }
})

export default () => {
  useEffect(() => {
    const check = setInterval(async () => {
      let res = await fetch('https://standby.hackclub.com/').then((res) => res.json())

      if (res.redirect == null) {
        return
      }

      window.location.href = res.redirect
    }, 500)
    return (() => {
      clearInterval(check)
    })
  }, [])
  const { colorMode } = useThemeUI()
  return (
    <Box
      as="main"
      sx={{
        backgroundColor: 'blue',
        color: 'white',
        background:
          `linear-gradient(to bottom, rgba(0, 0, 0, 0.325), rgba(0, 0, 0, 0.5)), url(${data.bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'left bottom',
        flex: '1 1 auto'
      }}
    >
      <style>{`#__next{display:flex;flex-direction:column;min-height:100vh;}`}</style>
      <Container
        variant="narrow"
        sx={{ py: [3, 4, 5], textAlign: 'center', textShadow: 'text' }}
      >
        <Avatar
          size={128}
          src={data.avatar}
          alt={data.name}
          sx={{
            boxShadow: (theme) =>
              `0 0 0 2px ${theme.colors.slate}, 0 0 0 6px ${theme.colors.red}`
          }}
        />
        <Text variant="headline" sx={{ textTransform: 'uppercase', mb: 3 }}>
          Hack Club
        </Text>
        <Heading
          as="h1"
          variant="title"
          color="white"
          sx={{ fontSize: [5, 6] }}
        >
          AMA with {data.first}&nbsp;{data.last}
        </Heading>
        <Box
          sx={{
            border: '4px dashed',
            borderColor: 'white',
            borderRadius: 'ultra',
            bg: 'rgba(0, 0, 0, 0.5)',
            p: [3, 4],
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
