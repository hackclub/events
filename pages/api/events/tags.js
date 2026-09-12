import { isabelle, passThrough } from '../../../lib/isabelle'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' })
  }

  const response = await isabelle('/internal/tags').catch(() => null)

  if (!response) {
    return res.status(503).json({ error: 'could not load tags', tags: [] })
  }

  return passThrough(res, response)
}
