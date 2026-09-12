import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import { Box, Container, Heading, Link as A, Message, Spinner, Text } from 'theme-ui'
import AuthGate from '../../../components/auth-gate'
import EventForm from '../../../components/event-form'
import StatusBadge from '../../../components/status-badge'
import { useSession } from '../../../components/session-context'
import { formFromEvent, payloadFromForm } from '../../../lib/event-form'
import { statusOf } from '../../../lib/event-status'

const EditEvent = () => {
  const router = useRouter()
  const { id, from } = router.query
  const { session, loading } = useSession()

  const [event, setEvent] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id || !session?.slackId) return

    fetch(`/api/events/${id}/`)
      .then(async res => {
        const body = await res.json().catch(() => ({}))
        if (res.status === 403) throw new Error('You can’t edit this event.')
        if (res.status === 404) throw new Error('That event doesn’t exist.')
        if (!res.ok) throw new Error(body.error || 'Could not load that event.')
        setEvent(body)
      })
      .catch(e => setLoadError(e.message))
  }, [id, session])

  const onSubmit = async form => {
    setBusy(true)
    setErrors({})

    try {
      const res = await fetch(`/api/events/${id}/`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payloadFromForm(form))
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrors(body.errors || { form: body.error || 'Could not save those changes.' })
        return
      }

      router.push(from === 'review' ? '/review' : '/my-events')
    } finally {
      setBusy(false)
    }
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
        title="Edit event"
        body="Sign in to edit your event."
        returnTo={`/events/${id || ''}/edit`}
      />
    )
  }

  if (loadError) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          {loadError}
        </Heading>
        <Link href="/my-events" passHref legacyBehavior>
          <A>Back to your events</A>
        </Link>
      </Container>
    )
  }

  if (!event) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Spinner size={48} color="primary" />
      </Box>
    )
  }

  return (
    <>
      <Meta as={Head} name="Hack Club Events" title={`Edit ${event.title}`} />
      <Box as="header" sx={{ bg: 'sheet', textAlign: 'center', py: [3, 4] }}>
        <Heading as="h1" variant="title">
          {event.title}
        </Heading>
        <Box sx={{ mt: 2 }}>
          <StatusBadge event={event} />
        </Box>
      </Box>

      <Container sx={{ maxWidth: 'copy', pt: [3, 4] }}>
        <Message variant={statusOf(event) === 'approved' ? 'alert' : undefined}>
          {statusOf(event) === 'approved'
            ? 'This event is already live. Changes go out straight away.'
            : 'This event is still waiting to be reviewed.'}
        </Message>
      </Container>

      <EventForm
        initialValues={formFromEvent(event)}
        errors={errors}
        busy={busy}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        footer={
          <Link href={from === 'review' ? '/review' : '/my-events'} passHref legacyBehavior>
            <A sx={{ fontSize: 1 }}>Discard changes</A>
          </Link>
        }
      />
    </>
  )
}

export default EditEvent
