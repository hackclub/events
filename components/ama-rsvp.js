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
import useForm from '../hooks/use-form'
import fetch from 'isomorphic-unfetch'
import Router from 'next/router'

const AMARsvp = ({ id, amaId }) => {
  const { status, formProps, useField } = useForm(
    '/api/ama-rsvp',
    r => {
      if (!r.waiver) {
        Router.push('/waiver')
      }
    },
    {
      clearOnSubmit: 2000,
      method: 'post',
      extraData: {
        id: amaId
      }
    }
  )

  useEffect(() => {}, [status])

  return (
    <Card sx={{ mt: [3, 4] }}>
      <Heading variant="headline" sx={{ mt: 0, mb: 1 }}>
        RSVP for this AMA
      </Heading>
      <form {...formProps}>
        <Grid gap={3} columns="1fr 1fr" sx={{ mb: 3 }}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              {...useField('name')}
              placeholder="Hacker McHackerston"
              sx={{ bg: 'sunken' }}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...useField('email')}
              placeholder="mchackerston@hacker.org"
              sx={{ bg: 'sunken' }}
              required
            />
          </div>
        </Grid>
        <Box sx={{ mb: 2 }}>
          <Label>What's your Slack handle?</Label>
          <Input
            {...useField('slack')}
            placeholder="@mchacker"
            sx={{ bg: 'sunken' }}
            required
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Label>How are you primarily associated with Hack Club?</Label>
          <Select
            {...useField('association')}
            sx={{
              bg: 'sunken',
              border: 0,
              color: 'text',
              fontFamily: 'inherit'
            }}
            required
          >
            <option value="" disabled selected hidden>
              Select...
            </option>
            <option value="club-leader">I lead a club</option>
            <option value="club-member">I am a club member</option>
            <option value="slack-member">I am active on Slack</option>
            <option value="alum">I'm a Hack Club alum</option>
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
