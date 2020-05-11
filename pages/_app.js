import * as React from 'react'
import NextApp from 'next/app'
import Head from 'next/head'

import Meta from '../components/meta'
import '@hackclub/theme/fonts/reg-bold.css'
import theme from '@hackclub/theme'
import { ThemeProvider } from 'theme-ui'
import Nav from '../components/nav'

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        <Meta
          as={Head}
          name="Hack Club"
          title="Events"
          description="See the upcoming events from the Hack Club community: AMAs, Code in the Dark, live coding sessions, & lots more."
          image="https://events.hackclub.com/card.png"
        />
        <Nav />
        <Component {...pageProps} />
      </ThemeProvider>
    )
  }
}
