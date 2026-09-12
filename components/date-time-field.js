import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Label, Text } from 'theme-ui'
import { Calendar, ChevronLeft, ChevronRight } from 'react-feather'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek
} from 'date-fns'

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm"
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const parseValue = value => {
  if (!value) return null
  const parsed = parse(value, VALUE_FORMAT, new Date())
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toValue = date => format(date, VALUE_FORMAT)

const withTime = (date, hours, minutes) => {
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}

const TIMES = Array.from({ length: 48 }, (_, i) => ({
  hours: Math.floor(i / 2),
  minutes: i % 2 === 0 ? 0 : 30
}))

const DateTimeField = ({ id, label, value, onChange, required }) => {
  const selected = parseValue(value)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(selected || new Date())
  const wrapRef = useRef(null)
  const triggerRef = useRef(null)
  const timeListRef = useRef(null)

  useEffect(() => {
    if (selected) setMonth(selected)
  }, [value])

  useEffect(() => {
    const onClickAway = event => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = event => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      timeListRef.current
        ?.querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: 'center' })
    }
  }, [open])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  const pickDay = day => {
    const base = selected || withTime(new Date(), 18, 0)
    onChange(toValue(withTime(day, base.getHours(), base.getMinutes())))
  }

  const pickTime = ({ hours, minutes }) => {
    const base = selected || new Date()
    onChange(toValue(withTime(base, hours, minutes)))
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <Box ref={wrapRef} sx={{ position: 'relative' }}>
      <Label htmlFor={id}>{label}</Label>

      <Flex
        as="button"
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        sx={{
          width: '100%',
          alignItems: 'center',
          gap: 2,
          px: 2,
          height: 44,
          bg: 'background',
          color: selected ? 'text' : 'placeholder',
          border: '1px solid',
          borderColor: open ? 'primary' : 'border',
          borderRadius: 'default',
          fontFamily: 'body',
          fontSize: 1,
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'border-color 140ms cubic-bezier(0.16, 1, 0.3, 1)',
          ':focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary',
            outlineOffset: '1px'
          }
        }}
      >
        <Calendar size={16} />
        <Text as="span" sx={{ flex: 1 }}>
          {selected ? format(selected, 'EEE d MMM yyyy, HH:mm') : 'Pick a date and time'}
        </Text>
      </Flex>

      <Box
        as="input"
        type="hidden"
        value={value || ''}
        required={required}
        readOnly
        sx={{ display: 'none' }}
      />

      {open && (
        <Box
          role="dialog"
          aria-modal="false"
          aria-label={`Choose ${label.toLowerCase()}`}
          sx={{
            position: 'absolute',
            zIndex: 30,
            mt: 1,
            left: 0,
            bg: 'elevated',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 'extra',
            boxShadow: 'elevated',
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box
                as="button"
                type="button"
                aria-label="Previous month"
                onClick={() => setMonth(m => addMonths(m, -1))}
                sx={navButton}
              >
                <ChevronLeft size={16} />
              </Box>
              <Text as="span" sx={{ fontSize: 1, fontWeight: 'bold' }}>
                {format(month, 'MMMM yyyy')}
              </Text>
              <Box
                as="button"
                type="button"
                aria-label="Next month"
                onClick={() => setMonth(m => addMonths(m, 1))}
                sx={navButton}
              >
                <ChevronRight size={16} />
              </Box>
            </Flex>

            <Grid columns={7} gap={0} sx={{ mb: 1 }}>
              {WEEKDAYS.map(day => (
                <Text
                  key={day}
                  as="span"
                  sx={{
                    fontSize: 0,
                    color: 'muted',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {day}
                </Text>
              ))}
            </Grid>

            <Grid columns={7} gap={0}>
              {days.map(day => {
                const isSelected = selected && isSameDay(day, selected)
                const outside = !isSameMonth(day, month)
                return (
                  <Box
                    key={day.toISOString()}
                    as="button"
                    type="button"
                    onClick={() => pickDay(day)}
                    sx={{
                      width: 34,
                      height: 34,
                      border: 0,
                      p: 0,
                      borderRadius: 'circle',
                      cursor: 'pointer',
                      fontFamily: 'body',
                      fontSize: 1,
                      fontVariantNumeric: 'tabular-nums',
                      bg: isSelected ? 'primary' : 'transparent',
                      color: isSelected
                        ? 'white'
                        : outside
                          ? 'placeholder'
                          : 'text',
                      fontWeight: isToday(day) && !isSelected ? 'bold' : 'body',
                      boxShadow:
                        isToday(day) && !isSelected ? 'inset 0 0 0 1px' : 'none',
                      transition: 'background-color 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                      ':hover': { bg: isSelected ? 'primary' : 'sunken' },
                      ':focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary',
                        outlineOffset: '-2px'
                      }
                    }}
                  >
                    {format(day, 'd')}
                  </Box>
                )
              })}
            </Grid>
          </Box>

          <Box
            ref={timeListRef}
            sx={{
              width: 96,
              maxHeight: 296,
              overflowY: 'auto',
              borderLeft: '1px solid',
              borderColor: 'border',
              py: 1
            }}
          >
            {TIMES.map(time => {
              const isSelected =
                selected &&
                selected.getHours() === time.hours &&
                selected.getMinutes() === time.minutes
              return (
                <Box
                  key={`${time.hours}-${time.minutes}`}
                  as="button"
                  type="button"
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => pickTime(time)}
                  sx={{
                    display: 'block',
                    width: '100%',
                    px: 3,
                    py: 2,
                    border: 0,
                    bg: isSelected ? 'primary' : 'transparent',
                    color: isSelected ? 'white' : 'text',
                    fontFamily: 'body',
                    fontSize: 1,
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'left',
                    cursor: 'pointer',
                    ':hover': { bg: isSelected ? 'primary' : 'sunken' }
                  }}
                >
                  {String(time.hours).padStart(2, '0')}:
                  {String(time.minutes).padStart(2, '0')}
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}

const navButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  p: 0,
  border: 0,
  borderRadius: 'circle',
  bg: 'transparent',
  color: 'text',
  cursor: 'pointer',
  ':hover': { bg: 'sunken' },
  ':focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '1px'
  }
}

export default DateTimeField
