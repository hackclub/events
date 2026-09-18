import { describe, expect, it } from 'vitest'
import { channelIdOf, channelIdsIn, describeVenue, normaliseVenue } from '../venue'

describe('normaliseVenue', () => {
  it('turns a typed channel into a link that works by name', () => {
    expect(normaliseVenue('#scrapbook')).toBe(
      'https://hackclub.slack.com/app_redirect?channel=scrapbook'
    )
  })

  it('tidies a channel someone typed with spaces or capitals', () => {
    expect(normaliseVenue('#Code in the Dark')).toContain(
      'channel=code-in-the-dark'
    )
  })

  it('leaves a real url alone', () => {
    expect(normaliseVenue('https://zoom.us/j/123')).toBe('https://zoom.us/j/123')
  })

  it('adds the scheme someone left off', () => {
    expect(normaliseVenue('google.com')).toBe('https://google.com/')
    expect(normaliseVenue('zoom.us/j/123')).toBe('https://zoom.us/j/123')
    expect(normaliseVenue('meet.google.com/abc-defg-hij')).toBe(
      'https://meet.google.com/abc-defg-hij'
    )
    expect(normaliseVenue('example.com:8443/room?id=2')).toBe(
      'https://example.com:8443/room?id=2'
    )
  })

  it('does not invent a scheme for something that is not a host', () => {
    expect(normaliseVenue('zoom')).toBe('zoom')
    expect(normaliseVenue('room 204, the library')).toBe('room 204, the library')
    expect(normaliseVenue('http://example.com')).toBe('http://example.com')
    expect(normaliseVenue('mailto:me@example.com')).toBe('mailto:me@example.com')
  })

  it('describes a scheme-less host the same as a full link', () => {
    expect(describeVenue('zoom.us/j/123').label).toBe('Zoom')
    expect(describeVenue('google.com').label).toBe('google.com')
  })

  it('returns empty for nothing usable', () => {
    expect(normaliseVenue('#')).toBe('')
    expect(normaliseVenue('   ')).toBe('')
    expect(normaliseVenue(null)).toBe('')
  })
})

describe('describeVenue', () => {
  const label = value => describeVenue(value)?.label
  const kind = value => describeVenue(value)?.kind

  it('names the channel when the link carries one', () => {
    expect(label('#scrapbook')).toBe('#scrapbook')
    expect(
      label('https://hackclub.slack.com/app_redirect?channel=lounge')
    ).toBe('#lounge')
  })

  it('says so plainly when the link only carries an id', () => {
    expect(label('https://hackclub.slack.com/archives/C0266FRGT')).toBe(
      'Slack channel'
    )
    expect(kind('https://hackclub.slack.com/archives/C0266FRGT')).toBe('channel')
  })

  it('uses a resolved name when one is supplied', () => {
    expect(
      describeVenue(
        'https://hackclub.slack.com/archives/C0266FRGT',
        'high-seas-bulletin'
      ).label
    ).toBe('#high-seas-bulletin')
  })

  it('never shows the hash twice', () => {
    const labels = [
      label('#scrapbook'),
      label('https://hackclub.slack.com/app_redirect?channel=lounge'),
      describeVenue('https://hackclub.slack.com/archives/C0266FRGT', 'lounge')
        .label
    ]
    labels.forEach(text => expect(text.match(/#/g)).toHaveLength(1))
  })

  it('tells a message permalink apart from a channel', () => {
    expect(
      label('https://hackclub.slack.com/archives/C0266FRGT/p1700000000')
    ).toBe('Slack message')
    expect(
      describeVenue(
        'https://hackclub.slack.com/archives/C0266FRGT/p1700000000',
        'lounge'
      ).label
    ).toBe('Message in #lounge')
  })

  it('recognises a huddle and names its channel when it can', () => {
    expect(label('https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF')).toBe(
      'Slack huddle'
    )
    expect(
      describeVenue(
        'https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF',
        'community'
      ).label
    ).toBe('Huddle in #community')
  })

  it('recognises the enterprise workspace too', () => {
    expect(
      kind('https://hackclub.enterprise.slack.com/archives/C0266FRGT')
    ).toBe('channel')
  })

  it.each([
    ['https://zoom.us/j/123456', 'Zoom'],
    ['https://hackclub.zoom.us/j/123', 'Zoom'],
    ['https://meet.google.com/abc-defg-hij', 'Google Meet'],
    ['https://discord.gg/abcdef', 'Discord'],
    ['https://www.youtube.com/watch?v=x', 'YouTube'],
    ['https://youtu.be/x', 'YouTube'],
    ['https://twitch.tv/hackclub', 'Twitch'],
    ['https://github.com/hackclub/events', 'GitHub'],
    ['https://hack.af/hidden-figures', 'Hack Club'],
    ['https://hack.af/z-join?id=6j836j', 'Zoom'],
    ['hack.af/z-join?id=vetgq', 'Zoom'],
    ['https://hack.af/z-joiner', 'Hack Club'],
    ['https://hack.club/hidden-figures', 'Hack Club']
  ])('recognises %s as %s', (url, expected) => {
    expect(label(url)).toBe(expected)
  })

  it('falls back to the hostname for anything else', () => {
    expect(label('https://www.example.com/thing')).toBe('example.com')
  })

  it('refuses anything that is not https', () => {
    expect(describeVenue('javascript:alert(1)')).toBeNull()
    expect(describeVenue('http://example.com')).toBeNull()
    expect(describeVenue('not a url')).toBeNull()
    expect(describeVenue(null)).toBeNull()
  })
})

describe('channelIdOf', () => {
  it('pulls the id out of the links that carry one', () => {
    expect(channelIdOf('https://hackclub.slack.com/archives/C0266FRGT')).toBe(
      'C0266FRGT'
    )
    expect(
      channelIdOf('https://hackclub.slack.com/archives/C0266FRGT/p1700000000')
    ).toBe('C0266FRGT')
    expect(
      channelIdOf('https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF')
    ).toBe('C01D7AHKMPF')
    expect(
      channelIdOf('https://app.slack.com/client/E09V59WQY1E/C07TM4C0AQ5')
    ).toBe('C07TM4C0AQ5')
  })

  it('has nothing to look up when the name is already there', () => {
    expect(channelIdOf('#scrapbook')).toBeNull()
    expect(
      channelIdOf('https://hackclub.slack.com/app_redirect?channel=lounge')
    ).toBeNull()
    expect(channelIdOf('https://zoom.us/j/123')).toBeNull()
    expect(channelIdOf(null)).toBeNull()
  })

  it('collects each id once', () => {
    expect(
      channelIdsIn([
        'https://hackclub.slack.com/archives/C0266FRGT',
        'https://hackclub.slack.com/archives/C0266FRGT/p1700000000',
        '#scrapbook',
        null
      ])
    ).toEqual(['C0266FRGT'])
  })
})

describe('venues people typed as a sentence', () => {
  it('uses a link buried in free text', () => {
    expect(
      describeVenue(
        'Flask workshop starting soon! Join here! https://hackclub.zoom.us/j/8148?pwd=x.1'
      ).label
    ).toBe('Zoom')
  })

  it('drops trailing punctuation from that link', () => {
    expect(normaliseVenue('Join at https://hackclub.com/events.')).toBe(
      'https://hackclub.com/events'
    )
  })

  it('still shows nothing when there is no link at all', () => {
    expect(describeVenue('Zoom URL will be posted soon!')).toBeNull()
  })
})
