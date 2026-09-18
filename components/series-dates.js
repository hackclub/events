import Link from 'next/link'
import { Box, Flex, Link as A, Text } from 'theme-ui'
import { Repeat } from 'react-feather'
import tt from 'tinytime'

const day = tt('{dddd} {MM} {DD}')
const clock = tt('{h}:{mm} {a}')

const SeriesDates = ({ dates = [], currentId, sx }) => {
  const upcoming = dates.filter(date => new Date(date.end) > new Date())
  if (dates.length < 2) return null

  const shown = upcoming.length > 1 ? upcoming : dates

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border',
        borderRadius: 'extra',
        overflow: 'hidden',
        mb: [3, 4],
        ...sx
      }}
    >
      <Flex
        sx={{
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          bg: 'sheet',
          borderBottom: '1px solid',
          borderColor: 'border'
        }}
      >
        <Repeat size={14} />
        <Text as="span" sx={{ fontSize: 1, fontWeight: 'bold' }}>
          {upcoming.length > 1
            ? `${upcoming.length} dates coming up`
            : 'Part of a series'}
        </Text>
      </Flex>

      <Box as="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {shown.map(date => {
          const isCurrent = date.id === currentId
          const label = `${day.render(new Date(date.start))} · ${clock.render(
            new Date(date.start)
          )}`

          return (
            <Flex
              as="li"
              key={date.id}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                px: 3,
                py: 2,
                fontSize: 1,
                bg: isCurrent ? 'sunken' : 'transparent',
                ':not(:first-of-type)': {
                  borderTop: '1px solid',
                  borderColor: 'border'
                }
              }}
            >
              {isCurrent ? (
                <Text as="span" sx={{ fontWeight: 'bold' }}>
                  {label}
                </Text>
              ) : (
                <Link href={`/${date.slug}`} passHref legacyBehavior>
                  <A sx={{ textDecoration: 'none' }}>{label}</A>
                </Link>
              )}

              {isCurrent && (
                <Text as="span" sx={{ fontSize: 0, color: 'muted' }}>
                  You are here
                </Text>
              )}
              {date.cancelled && (
                <Text as="span" sx={{ fontSize: 0, color: 'red' }}>
                  Cancelled
                </Text>
              )}
            </Flex>
          )
        })}
      </Box>
    </Box>
  )
}

export default SeriesDates
