import { Box, Flex, Label, Radio, Text } from 'theme-ui'
import { Repeat } from 'react-feather'

export const THIS = 'this'
export const FOLLOWING = 'following'
export const ALL = 'all'
export const SCOPES = [THIS, FOLLOWING, ALL]

const CHOICES = [
  {
    value: THIS,
    label: 'Only this date',
    hint: 'The rest of the series stays exactly as it is.'
  },
  {
    value: FOLLOWING,
    label: 'This and every date after it',
    hint: 'Earlier dates are left alone.'
  },
  {
    value: ALL,
    label: 'Every date in the series',
    hint: 'Dates you have already changed by hand keep their changes.'
  }
]

const ScopePicker = ({ value = THIS, onChange, count }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: 'border',
      borderRadius: 'extra',
      overflow: 'hidden'
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
        This repeats{count > 1 ? ` · ${count} dates` : ''}
      </Text>
    </Flex>

    <Box sx={{ px: 3, py: 2 }}>
      {CHOICES.map(choice => (
        <Label
          key={choice.value}
          sx={{
            alignItems: 'flex-start',
            gap: 1,
            py: 1,
            cursor: 'pointer',
            fontWeight: 'body'
          }}
        >
          <Radio
            name="scope"
            value={choice.value}
            checked={value === choice.value}
            onChange={() => onChange(choice.value)}
            sx={{ mt: '2px' }}
          />
          <Box>
            <Text as="span" sx={{ fontSize: 1 }}>
              {choice.label}
            </Text>
            <Text as="span" sx={{ display: 'block', fontSize: 0, color: 'muted' }}>
              {choice.hint}
            </Text>
          </Box>
        </Label>
      ))}
    </Box>
  </Box>
)

export default ScopePicker
