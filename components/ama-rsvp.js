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
    (r) => {
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

  return (
    <Card sx={{ mt: [3, 4] }}>
      <Heading variant="headline" sx={{ mt: 0, mb: 1 }}>
        RSVP for this AMA
      </Heading>
      <Grid
        gap={3}
        columns="1fr 1fr"
        sx={{
          mb: 3,
          label: { display: 'flex', flexDirection: 'column' },
          'input,select': { bg: 'sunken', boxShadow: 'none' }
        }}
        as="form"
        {...formProps}
      >
        <Label>
          Full Name
          <Input
            {...useField('name')}
            placeholder="Hacker McHackerston"
            required
          />
        </Label>
        <Label>
          Email
          <Input
            {...useField('email')}
            placeholder="mchackerston@hacker.org"
            required
          />
        </Label>
        <Label sx={{ gridColumn: 'span 2' }}>
          What’s your Slack handle?
          <Input {...useField('slack')} placeholder="@mchacker" required />
        </Label>
        <Label sx={{ gridColumn: 'span 2' }}>
          How are you primarily associated with Hack Club?
          <Select {...useField('association')} variant="forms.input" required>
            <option value="" disabled hidden>
              Select one…
            </option>
            <option value="club-leader">I lead a club</option>
            <option value="club-member">I am a club member</option>
            <option value="slack-member">I am active on Slack</option>
            <option value="alum">I am a Hack Club alum</option>
            <option value="none">None of the above</option>
          </Select>
        </Label>
        <Button
          as="button"
          type="submit"
          children={status === 'success' ? 'Signed up!' : 'RSVP me'}
          sx={{
            gridColumn: 'span 2',
            justifyContent: 'center',
            bg: status === 'success' ? 'green' : 'primary'
          }}
        />
      </Grid>
    </Card>
  )
}

export default AMARsvp
