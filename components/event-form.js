import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  Input,
  Label,
  Text,
  Textarea
} from 'theme-ui'
import { PAGE_WIDTH } from './page-header'
import { Eyebrow, Panel, PanelSection, scrollArea } from './panel'
import VenueField from './venue-field'
import { MAX_DESCRIPTION, MAX_TITLE } from '../lib/event-submission'
import { EMPTY_EVENT_FORM } from '../lib/event-form'
import DateTimeField from './date-time-field'
import RecurrenceField from './recurrence-field'
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

const Counter = ({ value, max }) => {
  const used = (value || '').length
  const close = used > max * 0.9

  return (
    <Text
      as="span"
      sx={{
        fontSize: 0,
        color: close ? 'orange' : 'muted',
        fontVariantNumeric: 'tabular-nums'
      }}
    >
      {used}/{max}
    </Text>
  )
}

const Section = ({ title, hint, children, dense }) => (
  <PanelSection sx={dense ? { px: [3, 4], py: 3 } : undefined}>
    <Flex sx={{ alignItems: 'baseline', gap: 2, mb: dense ? 2 : 3, flexWrap: 'wrap' }}>
      <Eyebrow sx={{ display: 'inline' }}>{title}</Eyebrow>
      {hint && (
        <Text as="span" sx={{ fontSize: 0, color: 'muted' }}>
          {hint}
        </Text>
      )}
    </Flex>
    <Box sx={{ display: 'grid', gap: dense ? 2 : 3 }}>{children}</Box>
  </PanelSection>
)

const EventForm = ({
  initialValues = EMPTY_EVENT_FORM,
  errors = {},
  busy = false,
  submitLabel = 'Send for review',
  onSubmit,
  onDirtyChange,
  footer,
  embedded = false,
  allowRecurrence = false
}) => {
  const [form, setForm] = useState(initialValues)
  const { tags: knownTags } = useKnownTags()

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))

  useEffect(() => {
    if (!onDirtyChange) return
    onDirtyChange(JSON.stringify(form) !== JSON.stringify(initialValues))
  }, [form, initialValues, onDirtyChange])

  const handleSubmit = event => {
    event.preventDefault()
    onSubmit(form)
  }

  const body = (
    <>
      <Section title="What it is" dense={embedded}>
        <Box>
          <Flex sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Label htmlFor="title" sx={{ width: 'auto', mb: 0 }}>
              Title
            </Label>
            <Counter value={form.title} max={MAX_TITLE} />
          </Flex>
          <Input
            id="title"
            name="title"
            value={form.title}
            maxLength={MAX_TITLE}
            placeholder="Code in the Dark"
            onChange={e => set('title', e.target.value)}
            required
          />
          <FieldError>{errors.title}</FieldError>
        </Box>

        <Box>
          <Flex sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Label htmlFor="description" sx={{ width: 'auto', mb: 0 }}>
              Description
            </Label>
            <Counter value={form.description} max={MAX_DESCRIPTION} />
          </Flex>
          <Textarea
            id="description"
            name="description"
            rows={embedded ? 4 : 6}
            maxLength={MAX_DESCRIPTION}
            placeholder="What happens, who it's for, and what to bring."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            required
          />
          <Note>Markdown works. Slack :emoji: shortcodes do too.</Note>
          <FieldError>{errors.description}</FieldError>
        </Box>
      </Section>

      <Section title="When" hint="In your local time" dense={embedded}>
        <Box
          sx={{ display: 'grid', gap: 3, gridTemplateColumns: [null, '1fr 1fr'] }}
        >
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

        {allowRecurrence && (
          <RecurrenceField
            start={form.start}
            value={form.recurrence}
            onChange={next => set('recurrence', next)}
          />
        )}
        <FieldError>{errors.recurrence}</FieldError>
      </Section>

      <Section title="Where" hint="Optional" dense={embedded}>
        <VenueField
          value={form.eventLink}
          onChange={v => set('eventLink', v)}
          error={errors.eventLink}
        />

        <Box>
          <Field
            label="External RSVP link"
            name="rsvpFormUrl"
            type="text"
            placeholder="https://..."
            value={form.rsvpFormUrl}
            onChange={e => set('rsvpFormUrl', e.target.value)}
          />
          <Note>
            If set, the RSVP button links here instead of collecting RSVPs.
          </Note>
          <FieldError>{errors.rsvpFormUrl}</FieldError>
        </Box>
      </Section>

      <Section title="Tags" hint="Helps people find it" dense={embedded}>
        <TagInput
          value={form.tags}
          knownTags={knownTags}
          onChange={tags => set('tags', tags)}
        />
      </Section>
    </>
  )

  const actions = (
    <>
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </Button>
      {footer}
    </>
  )

  if (embedded) {
    return (
      <Flex
        as="form"
        onSubmit={handleSubmit}
        sx={{ flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <Box sx={{ flex: 1, minHeight: 0, ...scrollArea }}>{body}</Box>

        <Box
          sx={{
            flex: 'none',
            px: [3, 4],
            py: 3,
            borderTop: '1px solid',
            borderColor: 'border'
          }}
        >
          <FieldError>{errors.form}</FieldError>
          <Flex sx={{ gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            {actions}
          </Flex>
        </Box>
      </Flex>
    )
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: PAGE_WIDTH, py: [3, 4] }}
    >
      <Panel>{body}</Panel>

      <FieldError>{errors.form}</FieldError>

      <Flex
        sx={{
          position: 'sticky',
          bottom: 0,
          gap: 3,
          alignItems: 'center',
          flexWrap: 'wrap',
          mt: 3,
          py: 3,
          bg: 'background',
          borderTop: '1px solid',
          borderColor: 'border'
        }}
      >
        {actions}
      </Flex>
    </Container>
  )
}

export default EventForm
