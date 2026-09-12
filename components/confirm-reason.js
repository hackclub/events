import { useState } from 'react'
import { Box, Button, Card, Flex, Heading, Label, Text, Textarea } from 'theme-ui'

const MIN_REASON = 10

const ConfirmReason = ({ event, verb, consequence, busy, error, onConfirm, onDismiss }) => {
  const [reason, setReason] = useState('')
  const ready = reason.trim().length >= MIN_REASON

  return (
    <Box
      onClick={onDismiss}
      sx={{
        position: 'fixed',
        inset: 0,
        bg: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        zIndex: 100
      }}
    >
      <Card
        onClick={e => e.stopPropagation()}
        sx={{ maxWidth: 'copy', width: '100%', bg: 'background' }}
      >
        <Heading as="h2" variant="subheadline" sx={{ mt: 0, mb: 2 }}>
          {verb === 'reject' ? 'Reject' : 'Cancel'} “{event?.title}”?
        </Heading>
        <Text as="p" variant="subtitle" sx={{ fontSize: 1, mb: 3 }}>
          {consequence}
        </Text>

        <Label htmlFor="reason">Why?</Label>
        <Textarea
          id="reason"
          rows={3}
          value={reason}
          autoFocus
          onChange={e => setReason(e.target.value)}
        />
        <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
          The organiser sees this, word for word.
        </Text>

        {error && (
          <Text as="p" sx={{ fontSize: 1, color: 'red', mt: 2 }}>
            {error}
          </Text>
        )}

        <Flex sx={{ gap: 3, mt: 3, alignItems: 'center' }}>
          <Button
            type="button"
            disabled={!ready || busy}
            onClick={() => onConfirm(reason.trim())}
            sx={{ bg: 'red' }}
          >
            {busy ? 'Working…' : verb === 'reject' ? 'Reject event' : 'Cancel event'}
          </Button>
          <Button type="button" variant="outline" onClick={onDismiss} disabled={busy}>
            Nevermind
          </Button>
        </Flex>
      </Card>
    </Box>
  )
}

export default ConfirmReason
