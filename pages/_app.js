import React from 'react'
import Head from 'next/head'

import Meta from '@hackclub/meta'
import '@hackclub/theme/fonts/reg-bold.css'
import theme from '@hackclub/theme'
import { ThemeUIProvider } from 'theme-ui'
import Nav from '../components/nav'

const App = ({ Component, pageProps }) => (
  <ThemeUIProvider theme={theme}>
    <Meta
      as={Head}
      name="Hack Club"
      title="Events"
      description="See the upcoming events from the Hack Club high school coding community: AMAs, CTFs, fireside chats, live coding sessions, & lots more."
      image="https://cloud-35gbvrq0s.vercel.app/2020-07-24_jqvwtt2xkqye541v21gqagg55zdevpj4.jpeg"
    />
    <Nav />
    <Component {...pageProps} />
  </ThemeUIProvider>
)

export default App
