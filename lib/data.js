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

export const getEvents = async () => {
  const slugger = new GHSlugger()

  // FOR TESTING
  const mockEvents = [
    {
      id: '1',
      slug: 'ai-ama',
      title: 'AI AMA with Elon',
      desc: 'Ask anything about AI!',
      leader: 'Elon Musk',
      cal: 'https://calendar.google.com/',
      start: '2025-12-15T18:00:00Z',
      end: '2025-12-15T20:00:00Z',
      youtube: null,
      ama: true,
      amaForm: false,
      amaId: '',
      amaAvatar: '',
      avatar: 'https://github.com/elonmusk.png',
      approved: true,
      tags: ['ama', 'ai'],
      cancelled: false,
      rawCancellation: null,
      interestCount: 128
    },
    {
      id: '2',
      slug: 'cancelled-workshop',
      title: 'React Workshop',
      desc: 'Learn React basics',
      leader: 'Dan Abramov',
      cal: 'https://calendar.google.com/',
      start: '2025-12-20T16:00:00Z',
      end: '2025-12-20T18:00:00Z',
      youtube: null,
      ama: false,
      amaForm: false,
      amaId: '',
      amaAvatar: '',
      avatar: 'https://github.com/gaearon.png',
      approved: true,
      tags: ['workshop', 'react'],
      cancelled: true,
      rawCancellation: 'Cancelled due to speaker illness. We will reschedule!',
      interestCount: 42
    },
    {
      id: '3',
      slug: 'regular-event',
      title: 'Weekly Show & Tell',
      desc: 'Show what you built this week!',
      leader: 'Zach Latta',
      cal: 'https://calendar.google.com/',
      start: '2026-12-18T19:00:00Z',
      end: '2026-12-19T20:30:00Z',
      youtube: null,
      ama: false,
      amaForm: false,
      amaId: '',
      amaAvatar: '',
      avatar: 'https://github.com/zachlatta.png',
      approved: true,
      tags: ['show-and-tell'],
      cancelled: false,
      rawCancellation: null,
      interestCount: 0
    }
  ]

  return orderBy(mockEvents, 'start')
}
