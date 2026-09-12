export const errorFrom = async (response, fallback) => {
  const body = await response.json().catch(() => null)
  if (body?.error) return body.error
  if (response.status === 401) return 'You need to sign in again.'
  if (response.status === 403) return 'You’re not allowed to do that.'
  if (response.status === 404) return 'That could not be found.'
  if (response.status >= 500) return 'The server had a problem. Try again.'
  return fallback
}
