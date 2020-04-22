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
        avatar: fields['Avatar'] ? fields['Avatar'][0].thumbnails.small.url : 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/320/apple/81/shrug_1f937.png'
      }))
    )
    .then((events) => orderBy(events, 'start'))
  return events
}
