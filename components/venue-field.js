import { useEffect, useRef, useState } from 'react'
import { scrollArea } from './panel'
import { Box, Flex, Input, Label, Text } from 'theme-ui'
import { Hash, Search } from 'react-feather'
import { describeVenue } from '../lib/venue'
import VenueLink from './venue-link'

const DEBOUNCE_MS = 180

const useChannelSearch = query => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query === null) {
      setChannels([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/slack/channels/?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )
        const body = await response.json()
        setChannels(response.ok ? body.channels || [] : [])
      } catch {
        if (!controller.signal.aborted) setChannels([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  return { channels, loading }
}

const VenueField = ({ id = 'eventLink', value = '', onChange, error }) => {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const searching = value.startsWith('#')
  const { channels, loading } = useChannelSearch(searching ? value.slice(1) : null)
  const options = searching ? channels : []

  useEffect(() => setHighlight(0), [value])

  useEffect(() => {
    const onClickAway = event => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const pick = channel => {
    onChange(`#${channel.name}`)
    setOpen(false)
    inputRef.current?.focus()
  }

  const onKeyDown = event => {
    if (!open || !options.length) return

    if (event.key === 'Enter') {
      event.preventDefault()
      pick(options[highlight])
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight(h => Math.min(h + 1, options.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
      return
    }
    if (event.key === 'Escape') setOpen(false)
  }

  const resolved = describeVenue(value)
  const exactMatch = options.some(c => `#${c.name}` === value)

  return (
    <Box ref={wrapRef} sx={{ position: 'relative' }}>
      <Label htmlFor={id}>Where is it? (optional)</Label>

      <Input
        ref={inputRef}
        id={id}
        name={id}
        type="text"
        role="combobox"
        aria-expanded={open && options.length > 0}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && options[highlight] ? `${id}-option-${highlight}` : undefined
        }
        autoComplete="off"
        placeholder="#hq, zoom.us/j/123, or any link"
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && searching && (
        <Box
          role="listbox"
          id={`${id}-listbox`}
          sx={{
            position: 'absolute',
            zIndex: 20,
            left: 0,
            right: 0,
            mt: 1,
            py: 1,
            bg: 'elevated',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 'default',
            boxShadow: 'elevated',
            maxHeight: 220,
            ...scrollArea
          }}
        >
          {loading && !options.length && (
            <Flex sx={{ alignItems: 'center', gap: 2, px: 3, py: 2 }}>
              <Search size={14} />
              <Text as="span" sx={{ fontSize: 1, color: 'muted' }}>
                Searching channels…
              </Text>
            </Flex>
          )}

          {!loading && !options.length && (
            <Text as="p" sx={{ px: 3, py: 2, fontSize: 1, color: 'muted' }}>
              No public channel matches that.
            </Text>
          )}

          {options.map((channel, index) => (
            <Flex
              key={channel.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === highlight}
              onMouseEnter={() => setHighlight(index)}
              onMouseDown={event => {
                event.preventDefault()
                pick(channel)
              }}
              sx={{
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                cursor: 'pointer',
                bg: index === highlight ? 'sunken' : 'transparent',
                fontSize: 1
              }}
            >
              <Hash size={14} strokeWidth={2.5} />
              <Text as="span">{channel.name}</Text>
            </Flex>
          ))}
        </Box>
      )}

      {error ? (
        <Text as="p" sx={{ fontSize: 1, color: 'red', mt: 1 }}>
          {error}
        </Text>
      ) : resolved ? (
        <Flex sx={{ alignItems: 'center', gap: 2, mt: 1, fontSize: 0 }}>
          <Text as="span" sx={{ color: 'muted' }}>
            Attendees will see
          </Text>
          <VenueLink url={value} size={12} sx={{ fontSize: 0 }} />
          {searching && !exactMatch && !loading && (
            <Text as="span" sx={{ color: 'orange' }}>
              not a channel we could find
            </Text>
          )}
        </Flex>
      ) : (
        <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
          Type # to search Slack channels. Defaults to the #community huddle.
        </Text>
      )}
    </Box>
  )
}

export default VenueField
