import { Flex, Text } from 'theme-ui'
import { isUnestablished } from '../lib/use-known-tags'

const TagList = ({ tags = [], knownTags = [], sx }) => {
  if (!tags.length) return null

  return (
    <Flex sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center', ...sx }}>
      {tags.map(tag => {
        const fresh = knownTags.length > 0 && isUnestablished(tag, knownTags)
        return (
          <Flex
            key={tag}
            sx={{
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: '3px',
              borderRadius: 'circle',
              bg: fresh ? 'background' : 'sunken',
              border: '1px solid',
              borderColor: fresh ? 'orange' : 'sunken',
              borderStyle: fresh ? 'dashed' : 'solid',
              fontSize: 0,
              lineHeight: 1
            }}
          >
            <Text as="span">{tag.replace(/-/g, ' ')}</Text>
            {fresh && (
              <Text
                as="span"
                sx={{
                  color: 'orange',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                new
              </Text>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

export default TagList
