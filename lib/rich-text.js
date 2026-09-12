const textFrom = elements =>
  (elements || [])
    .map(element => {
      if (element?.type === 'text') return element.text || ''
      if (element?.type === 'link') return element.text || element.url || ''
      if (element?.type === 'emoji') return `:${element.name}:`
      if (Array.isArray(element?.elements)) return textFrom(element.elements)
      return ''
    })
    .join('')

export const plainTextFromRichText = value => {
  if (!value) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed
    try {
      return plainTextFromRichText(JSON.parse(trimmed))
    } catch {
      return trimmed
    }
  }

  const elements = Array.isArray(value) ? value : value.elements
  const text = textFrom(elements)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')

  return text || null
}
