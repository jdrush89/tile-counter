import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    let receivedEvent = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedEvent = true
      if (active) { setUser(session?.user ?? null); setReady(true) }
    })
    supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active || receivedEvent) return
      if (failure) setError(failure.message)
      else setUser(data.session?.user ?? null)
      setReady(true)
    }).catch((failure: unknown) => {
      if (active) { setError(failure instanceof Error ? failure.message : String(failure)); setReady(true) }
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  return { user, ready, error }
}
