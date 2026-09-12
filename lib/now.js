export const now = () => {
  const override = process.env.DEV_NOW
  if (override && process.env.NODE_ENV !== 'production') {
    const parsed = new Date(override)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}
