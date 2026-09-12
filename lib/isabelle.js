export const isabelle = (path, { method = 'GET', body } = {}) =>
  fetch(`${process.env.ISABELLE_BASE_URL}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-internal-secret': process.env.ISABELLE_RSVP_SECRET
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

export const passThrough = async (res, isabelleRes) => {
  const body = await isabelleRes.json().catch(() => ({}))
  return res.status(isabelleRes.status).json(body)
}
