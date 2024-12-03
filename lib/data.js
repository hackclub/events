import GHSlugger from 'github-slugger'
import { orderBy } from 'lodash'

export const getEvents = async () => {
  const slugger = new GHSlugger()
  const res = await fetch('https://api2.hackclub.com/v0.1/Sessions/Events')
  const events = await res.json()

  const processedEvents = events.map(({ id, fields }) => ({
        id,
        slug: slugger.slug(fields['Title']),
        title: fields['Title'],
        desc: fields['Description'],
        leader: fields['Leader'],
        leaderSlackId: fields['Leader Slack ID'],
        cal: fields['Calendar Link'],
        start: fields['Start Time'],
        end: fields['End Time'],
        eventLink: fields['Event Link'],
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
        approved: fields['Approved'] || false,
        canceled: fields['Canceled'] || false,
      }))
      
    const filteredEvents = processedEvents
    .filter(event => event.approved)
    .filter(event => !event.canceled);

  return orderBy(filteredEvents, 'start');
}
