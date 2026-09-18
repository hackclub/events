import { describe, expect, it, vi, beforeEach } from 'vitest'
import handler from '../../pages/api/events/[id]/index.js'

vi.mock('iron-session', () => ({
  getIronSession: async () => ({ slackId: 'U0REVIEWER' })
}))

const sent = []

global.fetch = vi.fn(async (url, init) => {
  sent.push({ url, body: JSON.parse(init.body) })
  return { ok: true, status: 200, json: async () => ({ id: 'e1' }) }
})

const res = () => {
  const out = { statusCode: null, body: null }
  out.status = code => ((out.statusCode = code), out)
  out.json = body => ((out.body = body), out)
  return out
}

const req = scope => ({
  method: 'PATCH',
  query: { id: 'e1' },
  body: {
    title: 'Website Circle',
    description: 'A weekly build session that runs for an hour.',
    start: '2026-10-08T18:00:00.000Z',
    end: '2026-10-08T19:00:00.000Z',
    tags: [],
    ...(scope ? { scope } : {})
  }
})

describe('the edit proxy and the scope it is given', () => {
  beforeEach(() => {
    sent.length = 0
  })

  it('passes a real scope through to the backend', async () => {
    await handler(req('following'), res())
    expect(sent[0].body.scope).toBe('following')
  })

  it.each(['this', 'following', 'all'])('accepts %s', async scope => {
    await handler(req(scope), res())
    expect(sent[0].body.scope).toBe(scope)
  })

  it('sends no scope when none was asked for', async () => {
    await handler(req(null), res())
    expect('scope' in sent[0].body).toBe(false)
  })

  it('refuses to pass through something it does not recognise', async () => {
    await handler(req('everything'), res())
    expect('scope' in sent[0].body).toBe(false)
  })

  it('never lets the client choose the actor', async () => {
    const bad = req('all')
    bad.body.actor_slack_id = 'U0IMPOSTOR'
    await handler(bad, res())
    expect(sent[0].body.actor_slack_id).toBe('U0REVIEWER')
  })
})
