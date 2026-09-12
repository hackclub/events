import GHSlugger from 'github-slugger'
import { orderBy } from 'lodash'
import { plainTextFromRichText } from './rich-text'

const fetchJson = async (url, retries = 3) => {
  for (let attempt = 0; ; attempt += 1) {
    let response

    try {
      response = await fetch(url)
    } catch (error) {
      if (attempt === retries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
      continue
    }

    if (response.ok) return response.json()

    const body = await response.text()
    const retryable = [429, 500, 502, 503, 504].includes(response.status)

    if (!retryable || attempt === retries) {
      throw new Error(
        `Failed to fetch events (${response.status} ${response.statusText}): ${body.slice(0, 200)}`
      )
    }

    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
  }
}

const loadAllPublicEvents = async (page = 1) => {
  const slugger = new GHSlugger()
  const isabelleEventsTableRead = `${process.env.ISABELLE_BASE_URL}/events/`
  const events = await fetchJson(
    isabelleEventsTableRead + `?__order=-StartTime&__page=${page}`
  )
    .then(events => events.rows)
    .then(events =>
      events.map(e => ({
        id: e.id,
        slug: slugger.slug(e['Title']),
        title: e['Title'],
        desc: e['Description'],
        leader: e['Leader'],
        cal: e['CalendarLink'],
        start: e['StartTime'] + 'Z',
        end: e['EndTime'] + 'Z',
        youtube: e['YouTubeURL'] || null,
        ama: e['AMA'] || false,
        //TODO
        amaForm: false,
        amaId: '',
        //EOT
        amaAvatar: e['AMAAvatar'] ? e['AMAAvatar'] : '',
        avatar: e['Avatar'],
        approved: e['Approved'] || false,
        tags: e['Tags'] || [],
        interestCount: e['InterestCount'] || 0,
        leaderSlackId: e['LeaderSlackID'],
        rsvpFormUrl: e['RSVPFormURL'] || null,
        eventLink: e['EventLink'] || null,
        cancelled: e['Cancelled'] || false,
        cancellationType: e['CancellationType'] || null,
        cancellationReason: plainTextFromRichText(e['RawCancellation'])
      }))
    )
    .then(events =>
      events.filter(
        e => e.approved || (e.cancelled && e.cancellationType === 'cancelled')
      )
    )
    .then(events => orderBy(events, 'start'))

  return events
}

// Read per call rather than at module load so EVENTS_CACHE_MS can be changed
// after import. Setting it to 0 disables caching, which tests rely on.
const cacheMs = () => Number(process.env.EVENTS_CACHE_MS ?? 30000)
const cache = new Map()

export const getPublicEvents = (page = 1) => {
  const cached = cache.get(page)
  if (cached && Date.now() - cached.at < cacheMs()) return cached.promise

  const promise = loadAllPublicEvents(page)
  cache.set(page, { at: Date.now(), promise })
  promise.catch(() => cache.delete(page))

  return promise
}

// Entries are written even when the TTL is zero, so disabling the TTL is not
// enough to isolate callers that need a cold cache.
export const clearEventsCache = () => cache.clear()

export const getEvents = async () =>
  (await getPublicEvents()).filter(event => !event.cancelled)
