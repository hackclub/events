import { useState, useEffect } from 'react'
import { Button, Card, Grid, Heading, Input, Label, Text } from 'theme-ui'

const RSVP = ({ id }) => {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('')
  useEffect(() => {
    setTimeout(() => {
      setPhone('')
      setStatus('')
    }, 1500)
  }, [status])
  return (
    <Card sx={{ mt: [3, 4] }}>
      <Heading variant="headline" sx={{ mt: 0, mb: 1 }}>
        RSVP
      </Heading>
      <Text sx={{ mb: 3, color: 'muted' }}>(This doesn’t work yet!)</Text>
      <form
        action={`/api/rsvp?id=${id}`}
        onSubmit={e => {
          e.preventDefault()
          fetch(`/api/rsvp?id=${id}`, {
            method: 'POST',
            data: JSON.stringify({ phone })
          })
            .then(r => r.json())
            .then(r => setStatus(r.status))
        }}
      >
        <Grid gap={3} columns="1fr auto" sx={{ alignItems: 'end' }}>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="555-555-5555"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              sx={{ bg: 'sunken' }}
            />
          </div>
          <Button
            as="input"
            type="submit"
            value={status === 'success' ? 'Signed up!' : 'RSVP me'}
            sx={{ bg: status === 'success' ? 'green' : 'accent' }}
          />
        </Grid>
      </form>
    </Card>
  )
}

export default RSVP
