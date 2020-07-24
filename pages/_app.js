import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import NextApp from 'next/app'
import Head from 'next/head'

import Meta from '@hackclub/meta'
import '@hackclub/theme/fonts/reg-bold.css'
import theme from '@hackclub/theme'
import { ThemeProvider } from 'theme-ui'
import * as Fathom from 'fathom-client'
import Nav from '../components/nav'

const App = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    Fathom.load('ESMSQSYP', {
      includedDomains: ['events.hackclub.com'],
      url: 'https://aardvark.hackclub.com/script.js'
    })
    const onRouteChangeComplete = () => Fathom.trackPageview()
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Meta
        as={Head}
        name="Hack Club"
        title="Events"
        description="See the upcoming events from the Hack Club high school coding community: AMAs, CTFs, fireside chats, live coding sessions, & lots more."
        image="https://cloud-35gbvrq0s.vercel.app/2020-07-24_jqvwtt2xkqye541v21gqagg55zdevpj4.jpeg"
      />
      <Nav />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
