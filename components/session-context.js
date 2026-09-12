import { createContext, useContext, useEffect, useState } from 'react'

const SessionContext = createContext({
  session: null,
  capabilities: { canReview: false, canSubmit: false },
  loading: true,
  refresh: () => {}
})

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [capabilities, setCapabilities] = useState({
    canReview: false,
    canSubmit: false
  })
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const me = await fetch('/api/auth/me/').then(r => r.json())
        if (cancelled) return
        setSession(me)

        if (me?.slackId) {
          const res = await fetch('/api/auth/capabilities/').catch(() => null)
          const caps = res?.ok
            ? await res.json().catch(() => null)
            : { canReview: false, canSubmit: false, unavailable: true }
          if (!cancelled) {
            setCapabilities(caps || { canReview: false, canSubmit: false, unavailable: true })
          }
        } else {
          setCapabilities({ canReview: false, canSubmit: false })
        }
      } catch {
        if (!cancelled) {
          setSession({ slackId: null })
          setCapabilities({ canReview: false, canSubmit: false, unavailable: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [nonce])

  return (
    <SessionContext.Provider
      value={{
        session,
        capabilities,
        loading,
        refresh: () => setNonce(n => n + 1)
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
