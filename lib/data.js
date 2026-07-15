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

export const getEvents = async (page = 1) => {
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
        cancelled: e['Cancelled'] || false,
        rawCancellation: e['RawCancellation'] || null,
        interestCount:
          typeof e['InterestCount'] === 'number' ? e['InterestCount'] : 0,
        leaderSlackId: e['LeaderSlackID'],
        rsvpFormUrl: e['RSVPFormURL'] || null
      }))
    )
    .then(events => events.filter(e => e.approved))
    .then(events => orderBy(events, 'start'))

  return events
}
