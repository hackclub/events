//FOR FUTURE REFERENCE
export default (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!req.body?.phone) {
    return res.status(400).json({ error: 'Missing phone' })
  }
  res.json({ status: 'success' })
}
