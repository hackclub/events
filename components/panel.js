import { Box, Flex, Text } from 'theme-ui'

export const scrollArea = {
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--theme-ui-colors-sunken) transparent',
  '&::-webkit-scrollbar': { width: '10px' },
  '&::-webkit-scrollbar-track': { bg: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    bg: 'sunken',
    borderRadius: 'circle',
    border: '3px solid transparent',
    backgroundClip: 'padding-box'
  },
  '&::-webkit-scrollbar-thumb:hover': { bg: 'muted' }
}

export const Panel = ({ accent, children, sx }) => (
  <Box
    sx={{
      position: 'relative',
      bg: 'elevated',
      border: '1px solid',
      borderColor: 'border',
      borderRadius: 'extra',
      boxShadow: 'small',
      overflow: 'hidden',
      ...(accent
        ? {
            ':before': {
              content: '""',
              position: 'absolute',
              insetBlock: 0,
              left: 0,
              width: '3px',
              bg: accent
            }
          }
        : {}),
      ...sx
    }}
  >
    {children}
  </Box>
)

export const PanelSection = ({ children, dense, sx }) => (
  <Box
    sx={{
      px: dense ? 3 : [3, 4],
      py: dense ? 2 : [3, 3],
      ':not(:first-of-type)': { borderTop: '1px solid', borderColor: 'border' },
      ...sx
    }}
  >
    {children}
  </Box>
)

export const Eyebrow = ({ children, sx }) => (
  <Text
    as="span"
    sx={{
      display: 'block',
      fontSize: 0,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'muted',
      ...sx
    }}
  >
    {children}
  </Text>
)

export const MetaRow = ({ children, sx }) => (
  <Flex
    sx={{
      gap: 3,
      rowGap: 2,
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: 1,
      color: 'muted',
      ...sx
    }}
  >
    {children}
  </Flex>
)

export const MetaItem = ({ icon: Icon, children, sx }) =>
  children ? (
    <Flex sx={{ alignItems: 'center', gap: 1, minWidth: 0, ...sx }}>
      {Icon && <Icon size={14} />}
      <Text
        as="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {children}
      </Text>
    </Flex>
  ) : null
