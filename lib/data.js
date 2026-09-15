import GHSlugger from 'github-slugger'
import { orderBy } from 'lodash'

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

const _getEvents = async () => {
  const events = await fetch('https://api2.hackclub.com/v0.1/Sessions/Events')
    .then(r => r.json())
    .then(events =>
      events.map(({ id, fields }) => ({
        id,
        slug: slugger.slug(fields['Title']),
        title: fields['Title'],
        desc: fields['Description'],
        leader: fields['Leader'],
        cal: fields['Calendar Link'],
        start: fields['Start Time'],
        end: fields['End Time'],
        youtube: fields['YouTube URL'] || null,
        ama: fields['AMA'] || false,
        amaForm: fields['AMA Id'] || false,
        amaId: fields['AMA Id'] ? fields['AMA Id'] : '',
        amaAvatar: fields['AMA Avatar']
          ? fields['AMA Avatar'][0].thumbnails.large.url
          : '',
        avatar: fields['Avatar']
          ? fields['Avatar'][0].thumbnails.small.url
          : 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/320/apple/81/shrug_1f937.png',
        approved: fields['Approved'] || false
      }))
    )
    .then(events => events.filter(event => event.approved))
    .then(events => orderBy(events, 'start'))
  return events
}

// Isabelle serves a fixed number of events per page. Nothing tells us what
// that number is, so infer it from the first page and stop at the first short
// one rather than assuming a size the server might clamp.
const MAX_PAGES = 50

const fetchAllRows = async () => {
  const isabelleEventsTableRead = `${process.env.ISABELLE_BASE_URL}/events/`
  const rows = []
  let pageSize = null

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const body = await fetchJson(
      isabelleEventsTableRead + `?__order=-StartTime&__page=${page}`
    )
    const pageRows = body.rows ?? []
    rows.push(...pageRows)

    if (pageRows.length === 0) break
    if (pageSize === null) pageSize = pageRows.length
    else if (pageRows.length < pageSize) break
  }

  return rows
}

const loadEvents = async () => {
  const slugger = new GHSlugger()
  const events = await fetchAllRows()
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
        rsvpFormUrl: e['RSVPFormURL'] || null
      }))
    )
    .then(events => events.filter(e => e.approved))
    .then(events => orderBy(events, 'start'))

  return events
}

// Read per call rather than at module load so EVENTS_CACHE_MS can be changed
// after import. Setting it to 0 disables caching, which tests rely on.
const cacheMs = () => Number(process.env.EVENTS_CACHE_MS ?? 30000)
let cache = null

export const getEvents = () => {
  if (cache && Date.now() - cache.at < cacheMs()) return cache.promise

  const promise = loadEvents()
  cache = { at: Date.now(), promise }
  promise.catch(() => {
    if (cache?.promise === promise) cache = null
  })

  return promise
}

// Entries are written even when the TTL is zero, so disabling the TTL is not
// enough to isolate callers that need a cold cache.
export const clearEventsCache = () => {
  cache = null
}
