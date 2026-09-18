import { useEffect, useRef } from 'react'
import { Box, Flex, Heading, IconButton, Text } from 'theme-ui'
import { X } from 'react-feather'

const Modal = ({
  title,
  subtitle,
  onDismiss,
  children,
  closable = true,
  labelledBy = 'modal-title'
}) => {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    ;(closeRef.current || dialogRef.current)?.focus()

    const onKeyDown = event => {
      if (event.key === 'Escape') onDismiss()
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onDismiss])

  return (
    <Box
      onMouseDown={event => {
        if (event.target === event.currentTarget) onDismiss()
      }}
      sx={{
        position: 'fixed',
        inset: 0,
        bg: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: ['flex-end', 'center'],
        justifyContent: 'center',
        p: [0, 3],
        zIndex: 100
      }}
    >
      <Flex
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        sx={{
          outline: 'none',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 'copy',
          maxHeight: ['92vh', '88vh'],
          bg: 'background',
          borderRadius: ['ultra ultra 0 0', 'extra'],
          boxShadow: 'elevated',
          overflow: 'hidden'
        }}
      >
        <Flex
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 3,
            px: [3, 4],
            py: 3,
            borderBottom: '1px solid',
            borderColor: 'border',
            flex: 'none'
          }}
        >
          <Box>
            <Heading id={labelledBy} as="h2" variant="subheadline" sx={{ m: 0 }}>
              {title}
            </Heading>
            {subtitle && (
              <Text as="p" sx={{ fontSize: 1, color: 'muted', mt: 1 }}>
                {subtitle}
              </Text>
            )}
          </Box>
          {closable && (
            <IconButton
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onDismiss}
              sx={{
                flex: 'none',
                color: 'muted',
                cursor: 'pointer',
                ':hover': { color: 'text', bg: 'sunken' }
              }}
            >
              <X />
            </IconButton>
          )}
        </Flex>

        {children}
      </Flex>
    </Box>
  )
}

export default Modal
