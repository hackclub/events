import { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Field,
  Flex,
  Heading,
  Message,
  Spinner,
  Text
} from 'theme-ui'
import AuthGate from '../components/auth-gate'
import { useSession } from '../components/session-context'
import { errorFrom } from '../lib/api-error'

const Organisers = () => {
  const { session, capabilities, loading } = useSession()
  const [people, setPeople] = useState(null)
  const [form, setForm] = useState({ slackId: '', name: '', note: '' })
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/organisers/')
      if (!res.ok) {
        throw new Error(await errorFrom(res, 'Could not load the list.'))
      }
      const body = await res.json()
      setPeople(body.submitters || [])
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (capabilities.canReview) load()
  }, [capabilities.canReview, load])

  const add = async event => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/organisers/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        setError(await errorFrom(res, 'Could not add them.'))
        return
      }
      setFlash(`${form.name || form.slackId} can now submit events.`)
      setForm({ slackId: '', name: '', note: '' })
      await load()
    } finally {
      setBusy(false)
    }
  }

  const remove = async person => {
    setBusy(true)
    try {
      const res = await fetch(
        `/api/organisers/?slackId=${encodeURIComponent(person.slackId)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        setError(await errorFrom(res, 'Could not remove them.'))
        return
      }
      setFlash(`${person.name || person.slackId} can no longer submit events.`)
      await load()
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
        title="Organisers"
        body="Sign in to manage who can submit events."
        returnTo="/organisers"
      />
    )
  }

  if (!capabilities.canReview) {
    return (
      <Container sx={{ maxWidth: 'copy', py: [4, 5], textAlign: 'center' }}>
        <Heading as="h1" variant="title" sx={{ mb: 2 }}>
          Nothing to manage here
        </Heading>
        <Text as="p" variant="subtitle">
          This page is for the events team.
        </Text>
      </Container>
    )
  }

  return (
    <>
      <Meta as={Head} name="Hack Club Events" title="Organisers" />
      <Box as="header" sx={{ bg: 'sheet', textAlign: 'center', py: [3, 4] }}>
        <Heading as="h1" variant="title">
          Organisers
        </Heading>
        <Text as="p" variant="subtitle" sx={{ mt: 2 }}>
          Hack Club staff can always submit events. Add everyone else here.
        </Text>
      </Box>

      <Container sx={{ maxWidth: 'copy', py: [3, 4] }}>
        {flash && <Message sx={{ mb: 3 }}>{flash}</Message>}
        {error && (
          <Message variant="alert" sx={{ mb: 3 }}>
            {error}
          </Message>
        )}

        <Card
          as="form"
          onSubmit={add}
          sx={{ mb: [3, 4], display: 'grid', gap: 3 }}
        >
          <Field
            label="Slack ID"
            name="slackId"
            placeholder="U01234ABCDE"
            value={form.slackId}
            onChange={e => setForm({ ...form, slackId: e.target.value })}
            required
          />
          <Field
            label="Name (optional)"
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Field
            label="Why (optional)"
            name="note"
            placeholder="Runs the weekly CTF"
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
          <Button type="submit" disabled={busy} sx={{ justifySelf: 'start' }}>
            {busy ? 'Adding…' : 'Add organiser'}
          </Button>
        </Card>

        {people === null && !error && <Spinner size={32} color="primary" />}

        {people?.length === 0 && (
          <Text as="p" variant="subtitle" sx={{ textAlign: 'center', py: 3 }}>
            Nobody added yet.
          </Text>
        )}

        <Box sx={{ display: 'grid', gap: 2 }}>
          {people?.map(person => (
            <Card key={person.slackId}>
              <Flex sx={{ alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar
                  src={`https://cachet.hackclub.com/users/${person.slackId}/r`}
                  alt=""
                  sx={{ width: 36, height: 36, borderRadius: 'circle' }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Text as="p" sx={{ fontWeight: 'bold' }}>
                    {person.name || person.slackId}
                  </Text>
                  <Text as="p" sx={{ fontSize: 0, color: 'muted' }}>
                    {person.slackId}
                    {person.note ? ` · ${person.note}` : ''}
                  </Text>
                </Box>
                <Button
                  variant="outline"
                  sx={{ color: 'red' }}
                  disabled={busy}
                  onClick={() => remove(person)}
                >
                  Remove
                </Button>
              </Flex>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  )
}

export default Organisers
