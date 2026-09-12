import { useState } from 'react'
import { Box, Button, Container, Field, Label, Text, Textarea } from 'theme-ui'
import { MAX_DESCRIPTION, MAX_TITLE } from '../lib/event-submission'
import { EMPTY_EVENT_FORM } from '../lib/event-form'
import DateTimeField from './date-time-field'
import TagInput from './tag-input'
import { useKnownTags } from '../lib/use-known-tags'

const Note = ({ children }) => (
  <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
    {children}
  </Text>
)

const FieldError = ({ children }) =>
  children ? (
    <Text as="p" sx={{ fontSize: 0, color: 'red', mt: 1 }}>
      {children}
    </Text>
  ) : null

const EventForm = ({
  initialValues = EMPTY_EVENT_FORM,
  errors = {},
  busy = false,
  submitLabel = 'Send for review',
  onSubmit,
  footer
}) => {
  const [form, setForm] = useState(initialValues)
  const { tags: knownTags } = useKnownTags()

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  const handleSubmit = event => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit}
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
        <FieldError>{errors.title}</FieldError>
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
        <FieldError>{errors.description}</FieldError>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: [null, '1fr 1fr'] }}>
        <Box>
          <DateTimeField
            id="start"
            label="Starts"
            value={form.start}
            onChange={v => set('start', v)}
            required
          />
          <FieldError>{errors.start}</FieldError>
        </Box>
        <Box>
          <DateTimeField
            id="end"
            label="Ends"
            value={form.end}
            onChange={v => set('end', v)}
            required
          />
          <FieldError>{errors.end}</FieldError>
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
        <FieldError>{errors.eventLink}</FieldError>
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
        <Note>If set, the RSVP button links here instead of collecting RSVPs.</Note>
        <FieldError>{errors.rsvpFormUrl}</FieldError>
      </Box>

      <TagInput
        value={form.tags}
        knownTags={knownTags}
        onChange={tags => set('tags', tags)}
      />

      <FieldError>{errors.form}</FieldError>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {footer}
      </Box>
    </Container>
  )
}

export default EventForm
