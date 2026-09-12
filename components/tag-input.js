import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Label, Text } from 'theme-ui'
import { Plus, X } from 'react-feather'

export const normaliseTag = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

const MAX_TAGS = 6
const MAX_TAG_LENGTH = 24

const label = tag => tag.replace(/-/g, ' ')

const Chip = ({ tag, isNew, onRemove }) => (
  <Flex
    sx={{
      alignItems: 'center',
      gap: 1,
      pl: 2,
      pr: 1,
      py: '3px',
      borderRadius: 'circle',
      bg: isNew ? 'background' : 'sunken',
      color: 'text',
      border: '1px solid',
      borderColor: isNew ? 'orange' : 'sunken',
      borderStyle: isNew ? 'dashed' : 'solid',
      fontSize: 1,
      lineHeight: 1,
      maxWidth: '100%'
    }}
  >
    <Text
      as="span"
      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      {label(tag)}
    </Text>
    {isNew && (
      <Text
        as="span"
        sx={{
          fontSize: 0,
          color: 'orange',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 'bold'
        }}
      >
        new
      </Text>
    )}
    <Box
      as="button"
      type="button"
      aria-label={`Remove ${label(tag)}`}
      onClick={onRemove}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        p: 0,
        border: 0,
        borderRadius: 'circle',
        bg: 'transparent',
        color: 'muted',
        cursor: 'pointer',
        transition: 'background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms',
        ':hover': { bg: 'smoke', color: 'text' },
        ':focus-visible': { outline: '2px solid', outlineColor: 'primary', outlineOffset: '1px' }
      }}
    >
      <X size={13} strokeWidth={2.5} />
    </Box>
  </Flex>
)

const TagInput = ({ value = [], knownTags = [], onChange, id = 'tags' }) => {
  const names = useMemo(() => knownTags.map(t => t.name), [knownTags])
  const isNew = tag => {
    const match = knownTags.find(t => t.name === tag)
    if (!match) return true
    if (match.curated) return false
    return (match.approvedCount || 0) === 0
  }

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const normalisedQuery = normaliseTag(query)
  const atLimit = value.length >= MAX_TAGS

  const suggestions = useMemo(() => {
    const available = names.filter(tag => !value.includes(tag))
    if (!normalisedQuery) return available
    return available.filter(tag => tag.includes(normalisedQuery))
  }, [names, value, normalisedQuery])

  const canCreate =
    normalisedQuery.length > 0 &&
    normalisedQuery.length <= MAX_TAG_LENGTH &&
    !names.includes(normalisedQuery) &&
    !value.includes(normalisedQuery)

  const options = canCreate ? [...suggestions, normalisedQuery] : suggestions

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    const onClickAway = event => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const add = tag => {
    const clean = normaliseTag(tag)
    if (!clean || value.includes(clean) || atLimit) return
    onChange([...value, clean])
    setQuery('')
    setOpen(true)
    inputRef.current?.focus()
  }

  const remove = tag => {
    onChange(value.filter(t => t !== tag))
    inputRef.current?.focus()
  }

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (options[highlight]) add(options[highlight])
      return
    }
    if (event.key === 'Backspace' && !query && value.length) {
      remove(value[value.length - 1])
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlight(h => Math.min(h + 1, Math.max(options.length - 1, 0)))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
      return
    }
    if (event.key === 'Escape') setOpen(false)
  }

  return (
    <Box ref={wrapRef} sx={{ position: 'relative' }}>
      <Label htmlFor={id}>Tags</Label>

      <Flex
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
        sx={{
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          minHeight: 44,
          px: 2,
          py: 2,
          bg: 'background',
          border: '1px solid',
          borderColor: open ? 'primary' : 'border',
          borderRadius: 'default',
          cursor: 'text',
          transition: 'border-color 140ms cubic-bezier(0.16, 1, 0.3, 1)',
          ':focus-within': { borderColor: 'primary' }
        }}
      >
        {value.map(tag => (
          <Chip
            key={tag}
            tag={tag}
            isNew={isNew(tag)}
            onRemove={event => {
              event.stopPropagation()
              remove(tag)
            }}
          />
        ))}

        <Box
          as="input"
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[highlight] ? `${id}-option-${highlight}` : undefined
          }
          autoComplete="off"
          value={query}
          disabled={atLimit}
          placeholder={
            atLimit
              ? `That's the limit of ${MAX_TAGS}`
              : value.length
                ? 'Add another…'
                : 'Search tags, or type a new one'
          }
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          sx={{
            flex: '1 1 8rem',
            minWidth: '8rem',
            border: 0,
            outline: 'none',
            bg: 'transparent',
            color: 'text',
            fontFamily: 'body',
            fontSize: 1,
            py: '2px',
            '::placeholder': { color: 'placeholder' }
          }}
        />
      </Flex>

      {open && !atLimit && (options.length > 0 || normalisedQuery) && (
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
            overflowY: 'auto'
          }}
        >
          {options.length === 0 && (
            <Text as="p" sx={{ px: 3, py: 2, fontSize: 1, color: 'muted' }}>
              Nothing matches, and that isn’t a usable tag name.
            </Text>
          )}

          {options.map((tag, index) => {
            const creating = canCreate && index === options.length - 1
            const uses = knownTags.find(t => t.name === tag)?.count || 0
            return (
              <Flex
                key={tag}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === highlight}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={event => {
                  event.preventDefault()
                  add(tag)
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
                {creating && <Plus size={14} strokeWidth={2.5} />}
                <Text as="span">{creating ? `Create “${label(tag)}”` : label(tag)}</Text>
                {!creating && uses > 0 && (
                  <Text
                    as="span"
                    sx={{
                      ml: 'auto',
                      fontSize: 0,
                      color: 'muted',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {uses}
                  </Text>
                )}
                {creating && (
                  <Text
                    as="span"
                    sx={{
                      ml: 'auto',
                      fontSize: 0,
                      color: 'orange',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 'bold'
                    }}
                  >
                    new tag
                  </Text>
                )}
              </Flex>
            )
          })}
        </Box>
      )}

      <Text as="p" sx={{ fontSize: 0, color: 'muted', mt: 1 }}>
        {value.some(isNew)
          ? 'Dashed tags are new — reviewers will see they haven’t been used before.'
          : `Up to ${MAX_TAGS}. Type to search, or enter a name that doesn’t exist yet.`}
      </Text>
    </Box>
  )
}

export default TagInput
