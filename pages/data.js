import Head from 'next/head'
import Meta from '@hackclub/meta'
import { Container, BaseStyles } from 'theme-ui'
import Content from '../components/api.mdx'

export default () => (
  <>
    <Meta
      as={Head}
      title="Data API"
      name="Hack Club Events"
      description="API for Hack Club Events."
      image="https://events.hackclub.com/card.png"
    />
    <Container as={BaseStyles} variant="copy" sx={{ py: 3, fontSize: 2 }}>
      <Content />
    </Container>
  </>
)
