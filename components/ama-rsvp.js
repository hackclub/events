import { useState, useEffect } from 'react'
import {
  Button,
  Box,
  Card,
  Grid,
  Heading,
  Input,
  Label,
  Text,
  Select,
  Checkbox
} from 'theme-ui'
import fetch from 'isomorphic-unfetch'

const AMARsvp = ({ id }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [association, setAssociation] = useState('')
  const [status, setStatus] = useState('')
  useEffect(() => {
    setTimeout(() => {
      setEmail('')
      setName('')
      setAssociation('')
    }, 2000)
  }, [status])
  return (
    <Card sx={{ mt: [3, 4] }}>
      <Heading variant="headline" sx={{ mt: 0, mb: 1 }}>
        RSVP for this AMA
      </Heading>
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
        <Grid gap={3} columns="1fr 1fr" sx={{ alignItems: 'end', mb: 2 }}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="phone"
              name="name"
              placeholder="Hacker McHackerston"
              sx={{ bg: 'sunken' }}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="mchackerston@hacker.org"
              sx={{ bg: 'sunken' }}
            />
          </div>
        </Grid>
        <Box sx={{ mb: 3 }}>
          <Label>How are you primarily associated with Hack Club?</Label>
          <Select
            sx={{ bg: 'sunken', border: 0, color: 'text', fontFamily: 'inherit' }}
            defaultValue="Select..."
          >
            <option>I lead a club</option>
            <option>I am a club member</option>
            <option>I am active on Slack</option>
            <option>I'm a Hack Club alum</option>
          </Select>
        </Box>

        <Button
          as="input"
          type="submit"
          value={status === 'success' ? 'Signed up!' : 'RSVP me'}
          sx={{ bg: status === 'success' ? 'green' : 'primary' }}
        />
      </form>
    </Card>
  )
}

export default AMARsvp
