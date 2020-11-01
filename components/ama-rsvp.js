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
  Checkbox,
  Link
} from 'theme-ui'
import useForm from '../hooks/use-form'
import Router from 'next/router'

const AMARsvp = ({ id, amaId }) => {
  return (
    <Card>
      <Heading variant="headline" sx={{ mt: 0, mb: 1 }}>
        RSVP for this AMA
      </Heading>
      <Text variant="subtitle" mb={[3, 4]}>
        Click the button below.
      </Text>
      <Link href={`https://ama-machine.hackclub.com/rsvp/${amaId}`}>
        <Button
          as="button"
          type="submit"
          sx={{
            gridColumn: 'span 2',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          RSVP via the Hack Club Slack
        </Button>
      </Link>
    </Card>
  )
}

export default AMARsvp
