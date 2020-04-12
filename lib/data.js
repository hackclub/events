import fetch from 'isomorphic-unfetch'
import GHSlugger from 'github-slugger'
import { orderBy } from 'lodash'

export const getEvents = async () => {
  const slugger = new GHSlugger()
  const events = await fetch('https://api2.hackclub.com/v0/Sessions/Events')
    .then((r) => r.json())
    .then((events) =>
      events.map(({ id, fields }) => ({
        id,
        slug: slugger.slug(fields['Title']),
        title: fields['Title'],
        desc: fields['Description'],
        leader: fields['Leader'],
        cal: fields['Calendar Link'],
        start: fields['Start Time'],
        end: fields['End Time'],
        avatar: fields['Avatar'][0]?.thumbnails?.small?.url
      }))
    )
    .then((events) => orderBy(events, 'start'))
  return events
}
