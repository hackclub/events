import GHSlugger from 'github-slugger'
import { orderBy } from 'lodash'

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
  const isabelleEventsTableRead = "https://isabelle.hackclub.com/events/"
  const events = await fetch(isabelleEventsTableRead+`?__order=-StartTime&__page=${page}`)
    .then (r => r.json())
    .then(events => events.rows
    )
    .then(events =>
      events.map((e) => ({
        id: e.id,
        slug: slugger.slug(e['Title']),
        title: e['Title'],
        desc: e['Description'],
        leader: e['Leader'],
        cal: e['CalendarLink'],
        start: e['StartTime'],
        end: e['EndTime'],
        youtube: e['YouTubeURL'] || null,
        ama: e['AMA'] || false,
        //TODO
        amaForm: false,
        amaId: '',
        //EOT
        amaAvatar: e['AMAAvatar']
          ? e['AMAAvatar']
          : '',
        avatar: e['Avatar'],
        approved: e['Approved'] || false
      }))
    )
    .then(events => events.filter(e => e.approved))
    .then(events => orderBy(events,'start'))

    return events
  }