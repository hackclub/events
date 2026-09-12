import { useEffect, useState } from 'react'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import {
  Box,
  Button,
  Container,
  Checkbox,
  Field,
  Heading,
  Label,
  Spinner,
  Text,
  Textarea
} from 'theme-ui'
import { useRouter } from 'next/router'
import { EVENT_TAGS, MAX_DESCRIPTION, MAX_TITLE } from '../lib/event-submission'

const empty = {
  title: '',
  description: '',
  start: '',
  end: '',
  eventLink: '',
  rsvpFormUrl: '',
  tags: []
}

// datetime-local gives "2026-10-01T17:00" with no zone. Parsing that on the
// server would use the server's timezone, so resolve it here where the value
// was actually entered.
const toISO = value => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

const Note = ({ children }) => (
  <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
    {children}
  </Text>
)

const Error = ({ children }) =>
  children ? (
    <Text as="p" sx={{ fontSize: 0, color: 'red', mt: 1 }}>
      {children}
    </Text>
  ) : null

const SubmitPage = () => {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    fetch('/api/auth/me/')
      .then(r => r.json())
      .then(setSession)
      .catch(() => setSession({ slackId: null }))
  }, [])

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const toggleTag = tag =>
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))

  const onSubmit = async event => {
    event.preventDefault()
    setStatus('submitting')
    setErrors({})

    const res = await fetch('/api/events/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...form,
        start: toISO(form.start),
        end: toISO(form.end)
      })
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

  if (session === null) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Spinner size={48} color="primary" />
      </Box>
    )
  }

  if (!session.slackId) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          Submit an event
        </Heading>
        <Text as="p" variant="subtitle" sx={{ mb: [3, 4] }}>
          Sign in with your Hack Club Slack account to propose an event.
        </Text>
        <Button
          as="a"
          href={`/api/auth/login/?returnTo=${encodeURIComponent('/submit')}`}
        >
          Sign in with Slack
        </Button>
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
          Your event has been sent to the events team. You’ll get a Slack
          message when it’s approved, and it’ll appear on the site then.
        </Text>
        <Button
          sx={{ mt: [3, 4] }}
          onClick={() => {
            setForm(empty)
            setStatus('idle')
          }}
        >
          Submit another
        </Button>
      </Container>
    )
  }

  const busy = status === 'submitting'

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

      <Container
        as="form"
        onSubmit={onSubmit}
        sx={{ maxWidth: 'copy', py: [3, 4], display: 'grid', gap: 3 }}
      >
        <Box>
          <Field
            label="Title"
            name="title"
            value={form.title}
            maxLength={MAX_TITLE}
            onChange={e => set('title', e.target.value)}
            required
          />
          <Error>{errors.title}</Error>
        </Box>

        <Box>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={6}
            maxLength={MAX_DESCRIPTION}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            required
          />
          <Note>Markdown works. Slack :emoji: shortcodes do too.</Note>
          <Error>{errors.description}</Error>
        </Box>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: [null, '1fr 1fr'] }}>
          <Box>
            <Field
              label="Starts"
              name="start"
              type="datetime-local"
              value={form.start}
              onChange={e => set('start', e.target.value)}
              required
            />
            <Note>Your local time.</Note>
            <Error>{errors.start}</Error>
          </Box>
          <Box>
            <Field
              label="Ends"
              name="end"
              type="datetime-local"
              value={form.end}
              onChange={e => set('end', e.target.value)}
              required
            />
            <Error>{errors.end}</Error>
          </Box>
        </Box>

        <Box>
          <Field
            label="Where is it? (optional)"
            name="eventLink"
            type="url"
            placeholder="https://app.slack.com/huddle/..."
            value={form.eventLink}
            onChange={e => set('eventLink', e.target.value)}
          />
          <Note>Defaults to the #community huddle if you leave this blank.</Note>
          <Error>{errors.eventLink}</Error>
        </Box>

        <Box>
          <Field
            label="External RSVP link (optional)"
            name="rsvpFormUrl"
            type="url"
            placeholder="https://..."
            value={form.rsvpFormUrl}
            onChange={e => set('rsvpFormUrl', e.target.value)}
          />
          <Note>
            If set, the RSVP button links here instead of collecting RSVPs.
          </Note>
          <Error>{errors.rsvpFormUrl}</Error>
        </Box>

        <Box>
          <Text as="span" sx={{ fontWeight: 'bold', fontSize: 1 }}>
            Tags
          </Text>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            {EVENT_TAGS.map(tag => (
              <Label key={tag} sx={{ width: 'auto', alignItems: 'center' }}>
                <Checkbox
                  checked={form.tags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag.replace('-', ' ')}
              </Label>
            ))}
          </Box>
        </Box>

        <Error>{errors.form}</Error>

        <Button type="submit" disabled={busy} sx={{ justifySelf: 'start' }}>
          {busy ? 'Sending…' : 'Send for review'}
        </Button>
      </Container>
    </>
  )
}

export default SubmitPage
