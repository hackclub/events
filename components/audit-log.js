import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Flex, Spinner, Text } from 'theme-ui'
import tt from 'tinytime'
import { Panel, PanelSection } from './panel'
import { errorFrom } from '../lib/api-error'

const stamp = tt('{MM} {DD}, {h}:{mm} {a}')

const PAGE = 25

const VERBS = {
  approved: { word: 'approved', colour: 'green' },
  rejected: { word: 'rejected', colour: 'red' },
  cancelled: { word: 'cancelled', colour: 'red' },
  withdrawn: { word: 'withdrew', colour: 'muted' },
  edited: { word: 'edited', colour: 'orange' }
}

const AuditLog = () => {
  const [entries, setEntries] = useState(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (offset = 0) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/events/audit/?limit=${PAGE}&offset=${offset}`)
      if (!res.ok) throw new Error(await errorFrom(res, 'Could not load the log.'))

      const body = await res.json()
      setTotal(body.total || 0)
      setEntries(prev =>
        offset === 0 ? body.entries || [] : [...(prev || []), ...(body.entries || [])]
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    load(0)
  }, [load])

  if (entries === null && busy) return <Spinner size={32} color="primary" />

  if (error) {
    return (
      <Text as="p" sx={{ color: 'red', fontSize: 1 }}>
        {error}
      </Text>
    )
  }

  if (!entries?.length) {
    return (
      <Text as="p" sx={{ color: 'muted', fontSize: 1 }}>
        Nothing has been reviewed yet.
      </Text>
    )
  }

  return (
    <Box>
      <Panel>
        {entries.map(entry => {
          const verb = VERBS[entry.action] || { word: 'changed', colour: 'muted' }

          return (
            <PanelSection key={entry.id} dense>
              <Flex
                sx={{
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Text as="span" sx={{ fontSize: 1 }}>
                  <Text as="span" sx={{ fontWeight: 'bold' }}>
                    {entry.actorSlackId}
                  </Text>{' '}
                  <Text as="span" sx={{ color: verb.colour }}>
                    {verb.word}
                  </Text>{' '}
                  {entry.eventTitle}
                  {entry.affected > 1 && (
                    <Text as="span" sx={{ color: 'muted' }}>
                      {' '}
                      · {entry.affected} dates
                    </Text>
                  )}
                </Text>
                <Text
                  as="span"
                  sx={{ fontSize: 0, color: 'muted', whiteSpace: 'nowrap' }}
                >
                  {entry.at ? stamp.render(new Date(entry.at)) : ''}
                </Text>
              </Flex>

              {entry.reason && (
                <Text
                  as="p"
                  sx={{ mt: 1, mb: 0, fontSize: 0, color: 'secondary' }}
                >
                  “{entry.reason}”
                </Text>
              )}
            </PanelSection>
          )
        })}
      </Panel>

      {entries.length < total && (
        <Button
          variant="outline"
          disabled={busy}
          sx={{ mt: 3, fontSize: 1 }}
          onClick={() => load(entries.length)}
        >
          {busy ? 'Loading…' : `Show older (${total - entries.length} left)`}
        </Button>
      )}
    </Box>
  )
}

export default AuditLog
