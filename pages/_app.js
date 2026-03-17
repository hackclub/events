import Head from 'next/head'

import Meta from '@hackclub/meta'
import '@hackclub/theme/fonts/reg-bold.css'
import theme from '@hackclub/theme'
import { ThemeUIProvider } from 'theme-ui'
import Nav from '../components/nav'
import { Analytics } from "@vercel/analytics/next"

const App = ({ Component, pageProps }) => (
  <ThemeUIProvider theme={theme}>
    <Meta
      as={Head}
      name="Hack Club"
      title="Events"
      description="See the upcoming events from the Hack Club high school coding community: AMAs, CTFs, fireside chats, live coding sessions, & lots more."
      image="https://cdn.hackclub.com/019cfc2e-1cd4-7543-8a45-9a72287e5769/splash.png"
    />
    <Nav />
    <Component {...pageProps} />
    <Analytics />
  </ThemeUIProvider>
)

export default App
