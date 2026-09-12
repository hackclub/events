import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import { Box, Button, Container, Heading, Spinner, Text } from 'theme-ui'
import { useRouter } from 'next/router'
import AuthGate from '../components/auth-gate'
import EventForm from '../components/event-form'
import { useSession } from '../components/session-context'
import { EMPTY_EVENT_FORM, payloadFromForm } from '../lib/event-form'

const SubmitPage = () => {
  const router = useRouter()
  const { session, capabilities, loading } = useSession()
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [formKey, setFormKey] = useState(0)

  const onSubmit = async form => {
    setStatus('submitting')
    setErrors({})

    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payloadFromForm(form))
    }).catch(() => null)

    if (!res) {
      setStatus('idle')
      setErrors({ form: 'Could not reach the server. Try again.' })
      return
    }

    if (res.status === 401) {
      router.push(`/api/auth/login/?returnTo=${encodeURIComponent('/submit')}`)
      return
    }

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setStatus('idle')
      setErrors(body.errors || { form: body.error || 'Something went wrong.' })
      return
    }

    setStatus('done')
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Spinner size={48} color="primary" />
      </Box>
    )
  }

  if (!session?.slackId) {
    return (
      <AuthGate
        title="Submit an event"
        body="Sign in with your Hack Club Slack account to propose an event."
        returnTo="/submit"
      />
    )
  }

  if (!capabilities.canSubmit) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          Submitting is invite-only for now
        </Heading>
        <Text as="p" variant="subtitle">
          Events are submitted by Hack Club staff and a handful of trusted
          organisers. If you would like to run one, ask in #community and
          someone on the events team can add you.
        </Text>
      </Container>
    )
  }

  if (status === 'done') {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" color="green" sx={{ mb: 2 }}>
          Sent for review
        </Heading>
        <Text as="p" variant="subtitle">
          Your event has been sent to the events team. You’ll get a Slack message
          when it’s approved, and it’ll appear on the site then.
        </Text>
        <Box sx={{ mt: [3, 4], display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => {
              setFormKey(k => k + 1)
              setStatus('idle')
            }}
          >
            Submit another
          </Button>
          <Link href="/my-events" passHref legacyBehavior>
            <Button as="a" variant="outline">
              View your events
            </Button>
          </Link>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Meta
        as={Head}
        name="Hack Club Events"
        title="Submit an event"
        description="Propose an event for events.hackclub.com."
      />
      <Box as="header" sx={{ bg: 'sheet', textAlign: 'center', py: [3, 4] }}>
        <Heading as="h1" variant="title">
          Submit an event
        </Heading>
        <Text as="p" variant="subtitle" sx={{ mt: 2 }}>
          Events are reviewed before they appear on the site.
        </Text>
      </Box>

      <EventForm
        key={formKey}
        initialValues={EMPTY_EVENT_FORM}
        errors={errors}
        busy={status === 'submitting'}
        submitLabel="Send for review"
        onSubmit={onSubmit}
      />
    </>
  )
}

export default SubmitPage
