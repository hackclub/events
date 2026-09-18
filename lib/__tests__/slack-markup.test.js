import { describe, expect, it } from 'vitest'
import {
  slackIdsIn,
  slackMarkupToMarkdown,
  slackMarkupToPlain
} from '../slack-markup'

const NAMES = {
  C091UF79VDM: { kind: 'channel', name: 'slackbot-workshop' },
  U054VC2KM9P: { kind: 'user', name: 'wally' }
}

describe('slackIdsIn', () => {
  it('finds the ids that still need a name', () => {
    expect(
      slackIdsIn('Part of <#C091UF79VDM>, run by <@U054VC2KM9P>!')
    ).toEqual(['C091UF79VDM', 'U054VC2KM9P'])
  })

  it('skips ids that already carry their label', () => {
    expect(slackIdsIn('Part of <#C091UF79VDM|lounge>')).toEqual([])
  })

  it('collects each id once and ignores broadcasts', () => {
    expect(
      slackIdsIn('<#C1AAA> and <#C1AAA> and <!here>')
    ).toEqual(['C1AAA'])
  })

  it('copes with nothing to do', () => {
    expect(slackIdsIn('')).toEqual([])
    expect(slackIdsIn(null)).toEqual([])
    expect(slackIdsIn('no mentions here')).toEqual([])
  })
})

describe('slackMarkupToMarkdown', () => {
  it('links a channel mention under its real name', () => {
    expect(slackMarkupToMarkdown('Part of <#C091UF79VDM>!', NAMES)).toBe(
      'Part of [#slackbot-workshop](https://hackclub.slack.com/app_redirect?channel=slackbot-workshop)!'
    )
  })

  it('prefers the label Slack already put in the mention', () => {
    expect(slackMarkupToMarkdown('<#C1AAA|lounge>', NAMES)).toContain('[#lounge]')
  })

  it('stays readable when the name cannot be resolved', () => {
    expect(slackMarkupToMarkdown('Join us in <#CCW6Q86UF>!', {})).toBe(
      'Join us in [a Slack channel](https://hackclub.slack.com/archives/CCW6Q86UF)!'
    )
  })

  it('links a person', () => {
    expect(slackMarkupToMarkdown('Hosted by <@U054VC2KM9P>', NAMES)).toBe(
      'Hosted by [@wally](https://hackclub.slack.com/team/U054VC2KM9P)'
    )
  })

  it('turns broadcasts into plain text', () => {
    expect(slackMarkupToMarkdown('<!here> come along', NAMES)).toBe(
      '@here come along'
    )
  })

  it('unwraps the links Slack brackets', () => {
    expect(
      slackMarkupToMarkdown('See <https://hackclub.com|Hack Club>', NAMES)
    ).toBe('See [Hack Club](https://hackclub.com)')
    expect(slackMarkupToMarkdown('See <https://hackclub.com>', NAMES)).toBe(
      'See https://hackclub.com'
    )
  })

  it('does not let a label break out of the link', () => {
    expect(
      slackMarkupToMarkdown('<https://example.com|click [here]>', NAMES)
    ).toBe('[click \\[here\\]](https://example.com)')
  })

  it('leaves ordinary text alone', () => {
    const text = 'A workshop about building a Slackbot with JavaScript.'
    expect(slackMarkupToMarkdown(text, NAMES)).toBe(text)
    expect(slackMarkupToMarkdown('', NAMES)).toBe('')
    expect(slackMarkupToMarkdown(null, NAMES)).toBe('')
  })
})

describe('slackMarkupToPlain', () => {
  it('reads as plain prose', () => {
    expect(
      slackMarkupToPlain(
        'Part of <#C091UF79VDM> with <@U054VC2KM9P>, see <https://hackclub.com|us>',
        NAMES
      )
    ).toBe('Part of #slackbot-workshop with @wally, see us')
  })

  it('never leaves raw mention syntax behind', () => {
    expect(slackMarkupToPlain('Join us in <#CCW6Q86UF>!', {})).toBe(
      'Join us in a Slack channel!'
    )
    expect(slackMarkupToPlain('Ask <@U9ZZZ>', {})).toBe('Ask someone on Slack')
  })
})
