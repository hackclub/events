import { useEffect, useState } from 'react'
import { EVENT_TAGS } from './event-submission'

const FALLBACK = EVENT_TAGS.map(name => ({
  name,
  count: 0,
  approvedCount: 0,
  curated: true
}))

export const useKnownTags = () => {
  const [tags, setTags] = useState(FALLBACK)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/events/tags/')
      .then(r => (r.ok ? r.json() : null))
      .then(body => {
        if (cancelled || !body?.tags?.length) return
        setTags(body.tags)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { tags, loaded }
}

export const isUnestablished = (tag, knownTags) => {
  const match = knownTags.find(t => t.name === tag)
  if (!match) return true
  if (match.curated) return false
  return (match.approvedCount || 0) === 0
}
