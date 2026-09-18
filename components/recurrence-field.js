import { Box, Flex, Input, Label, Select, Text } from 'theme-ui'
import { Repeat } from 'react-feather'
import tt from 'tinytime'
import {
  COUNT,
  FREQUENCIES,
  MAX_COUNT,
  MAX_INTERVAL,
  NEVER,
  NONE,
  UNTIL,
  WEEKDAYS,
  WEEKLY,
  occurrences,
  ruleFrom,
  validateRecurrence
} from '../lib/recurrence'

const short = tt('{Mo}/{DD}')

const ENDINGS = [
  { value: COUNT, label: 'After a number of dates' },
  { value: UNTIL, label: 'On a date' },
  { value: NEVER, label: 'Never' }
]

const DayToggle = ({ day, on, onToggle }) => (
  <Box
    as="button"
    type="button"
    role="checkbox"
    aria-checked={on}
    aria-label={day.label}
    title={day.label}
    onClick={onToggle}
    sx={{
      width: 34,
      height: 34,
      p: 0,
      borderRadius: 'circle',
      border: '1px solid',
      borderColor: on ? 'primary' : 'border',
      bg: on ? 'primary' : 'background',
      color: on ? 'white' : 'muted',
      fontFamily: 'body',
      fontSize: 1,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 120ms, border-color 120ms, color 120ms',
      ':hover': { borderColor: 'primary' },
      ':focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary',
        outlineOffset: '2px'
      }
    }}
  >
    {day.short}
  </Box>
)

const preview = (start, form) => {
  const rule = ruleFrom(form)
  if (!rule || !start) return null

  const dates = occurrences(start, rule)
  if (dates.length < 2) return null

  const shown = dates.slice(0, 4).map(date => short.render(date))
  const endless = form.endsType === NEVER || form.endsType === UNTIL
  const rest = dates.length - shown.length

  if (rest > 0 || endless) {
    return `${shown.join(', ')}${endless && rest <= 0 ? ' and on' : ` and ${rest} more`}`
  }

  return shown.join(', ')
}

const RecurrenceField = ({ start, value, onChange }) => {
  const form = { ...value, start }
  const repeating = form.frequency && form.frequency !== NONE
  const weekly = form.frequency === WEEKLY
  const error = validateRecurrence(form)
  const dates = error ? null : preview(start, form)

  const set = next => onChange({ ...value, ...next })

  const toggleDay = code => {
    const current = form.byDay || []
    set({
      byDay: current.includes(code)
        ? current.filter(day => day !== code)
        : [...current, code]
    })
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box>
        <Label htmlFor="frequency">Repeats</Label>
        <Flex sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 11rem' }}>
            <Select
              id="frequency"
              name="frequency"
              value={form.frequency || NONE}
              onChange={e => set({ frequency: e.target.value })}
            >
              {FREQUENCIES.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Box>

          {repeating && (
            <Flex sx={{ alignItems: 'center', gap: 2 }}>
              <Text as="span" sx={{ fontSize: 1, color: 'muted' }}>
                every
              </Text>
              <Input
                id="interval"
                name="interval"
                type="number"
                min={1}
                max={MAX_INTERVAL}
                value={form.interval ?? 1}
                onChange={e => set({ interval: Number(e.target.value) })}
                sx={{ width: '4.5rem' }}
              />
            </Flex>
          )}
        </Flex>
      </Box>

      {weekly && (
        <Box>
          <Label>On these days</Label>
          <Flex sx={{ gap: 1, flexWrap: 'wrap' }}>
            {WEEKDAYS.map(day => (
              <DayToggle
                key={day.code}
                day={day}
                on={(form.byDay || []).includes(day.code)}
                onToggle={() => toggleDay(day.code)}
              />
            ))}
          </Flex>
          <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
            Leave blank to repeat on the same day as the first date.
          </Text>
        </Box>
      )}

      {repeating && (
        <Box>
          <Label htmlFor="endsType">Ends</Label>
          <Flex sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 11rem' }}>
              <Select
                id="endsType"
                name="endsType"
                value={form.endsType || COUNT}
                onChange={e => set({ endsType: e.target.value })}
              >
                {ENDINGS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Box>

            {(form.endsType || COUNT) === COUNT && (
              <Flex sx={{ alignItems: 'center', gap: 2 }}>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  min={2}
                  max={MAX_COUNT}
                  value={form.count ?? 4}
                  onChange={e => set({ count: e.target.value })}
                  sx={{ width: '5rem' }}
                />
                <Text as="span" sx={{ fontSize: 1, color: 'muted' }}>
                  dates
                </Text>
              </Flex>
            )}

            {form.endsType === UNTIL && (
              <Input
                id="until"
                name="until"
                type="date"
                value={form.until || ''}
                onChange={e => set({ until: e.target.value })}
                sx={{ width: 'auto' }}
              />
            )}
          </Flex>
        </Box>
      )}

      {error ? (
        <Text as="p" sx={{ fontSize: 0, color: 'red' }}>
          {error}
        </Text>
      ) : dates ? (
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <Repeat size={12} />
          <Text as="span" sx={{ fontSize: 0, color: 'muted' }}>
            {dates}
          </Text>
        </Flex>
      ) : repeating ? (
        <Text as="p" sx={{ fontSize: 0, color: 'muted' }}>
          Set a start time to see the dates.
        </Text>
      ) : null}
    </Box>
  )
}

export default RecurrenceField
