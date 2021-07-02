import React from 'react'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import '@hackclub/theme/fonts/reg-bold.css'
import theme from '../lib/theme'
import { ThemeProvider } from 'theme-ui'
import Nav from '../components/nav'

const App = ({ Component, pageProps }) => (
  <ThemeProvider theme={theme}>
    <Meta
      as={Head}
      name="Hack Club"
      title="Events in the Wild West"
      description="See the upcoming events from the Hack Club high school coding community: AMAs, CTFs, fireside chats, live coding sessions, & lots more."
      image="https://events.hackclub.com/hc_events_wild_west.png"
      color={theme.colors.sheet}
    />
    <Nav />
    <Component {...pageProps} />
  </ThemeProvider>
)

export default App
