import { Box, Container, Flex, Heading, Text } from 'theme-ui'

export const PAGE_WIDTH = 'copyPlus'

const PageHeader = ({ title, subtitle, action }) => (
  <Box
    as="header"
    sx={{ bg: 'sheet', borderBottom: '1px solid', borderColor: 'sunken' }}
  >
    <Container sx={{ maxWidth: PAGE_WIDTH, py: [3, 4] }}>
      <Flex
        sx={{
          gap: 3,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Heading as="h1" variant="headline" sx={{ m: 0 }}>
            {title}
          </Heading>
          {subtitle && (
            <Text as="p" sx={{ fontSize: 1, color: 'muted', mt: 1 }}>
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>
    </Container>
  </Box>
)

export default PageHeader
