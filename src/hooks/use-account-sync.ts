import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { z } from 'zod'
import { readStorage, writeStorage } from '@/hooks/use-storage'
import { EMPTY_ACCOUNT_DATA, mergeAccountData, type AccountData, type SyncConflict } from '@/lib/account-data'
import { supabase } from '@/lib/supabase'

const dataSchema = z.object({
  tallies: z.array(z.object({
    id: z.string(), title: z.string(), count: z.number(), color: z.string(),
    animalType: z.number().optional(), goal: z.number().optional(),
  }).passthrough()),
  tallyEvents: z.array(z.object({
    tallyId: z.string(), timestamp: z.number(), change: z.number(), note: z.string().optional(),
  }).passthrough()),
  dailyTallyNotes: z.array(z.object({
    tallyId: z.string(), date: z.string(), note: z.string(),
  }).passthrough()),
}).refine(data => new Set(data.tallies.map(tally => tally.id)).size === data.tallies.length, 'Duplicate tally IDs need to be resolved before syncing').transform(data => ({
  ...data,
  tallies: data.tallies.map(tally => ({ ...tally, animalType: tally.animalType ?? 0 })),
}))

interface Cache {
  data: AccountData
  base: AccountData
  revision: number | null
  guestBase: AccountData
}

export interface PendingConflict {
  kind: 'guest' | 'cloud'
  base: AccountData
  remote: AccountData
  revision: number | null
  conflicts: SyncConflict[]
}

type Setter<T> = (value: T | ((previous: T | undefined) => T)) => void

function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  return String(error)
}

export function useAccountSync(userId: string | null, deviceId: string) {
  const [cache, setCache] = useState<Cache | null>(null)
  const [status, setStatus] = useState('Preparing account data...')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingConflict | null>(null)
  const cacheRef = useRef<Cache | null>(null)
  const pendingRef = useRef<PendingConflict | null>(null)
  const saving = useRef<Promise<void>>(Promise.resolve())
  const syncing = useRef(false)
  const mounted = useRef(false)
  const releaseLock = useRef<(() => void) | null>(null)

  const persist = useCallback((next: Cache) => {
    cacheRef.current = next
    setCache(next)
    if (!userId) return
    saving.current = saving.current.catch(() => {}).then(() => writeStorage(`account-sync-${userId}`, next))
    saving.current.catch((failure: unknown) => {
      if (mounted.current) setError(`Could not save on this device: ${errorMessage(failure)}`)
    })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let active = true
    mounted.current = true
    const initialize = async () => {
      if (!Capacitor.isNativePlatform()) {
        if (!navigator.locks) throw new Error('This browser does not support safe account syncing. Update your browser or use another device.')
        const acquired = await new Promise<boolean>((resolve, reject) => {
          navigator.locks.request(`tally-account-${userId}`, { ifAvailable: true }, async lock => {
            if (!lock) { resolve(false); return }
            if (!active) { resolve(false); return }
            resolve(true)
            await new Promise<void>(release => { releaseLock.current = release })
          }).catch(reject)
        })
        if (!acquired) throw new Error('This account is already open in another tab. Close that tab and reload.')
      }

      const [stored, tallies, tallyEvents, dailyTallyNotes] = await Promise.all([
        readStorage<Cache>(`account-sync-${userId}`),
        readStorage<AccountData['tallies']>(`tallies-${deviceId}`),
        readStorage<AccountData['tallyEvents']>(`tally-events-${deviceId}`),
        readStorage<AccountData['dailyTallyNotes']>(`daily-tally-notes-${deviceId}`),
      ])
      const guest = dataSchema.parse({ tallies: tallies ?? [], tallyEvents: tallyEvents ?? [], dailyTallyNotes: dailyTallyNotes ?? [] })
      if (!active) return
      if (!stored) {
        persist({ data: guest, base: EMPTY_ACCOUNT_DATA, revision: null, guestBase: guest })
        return
      }
      const current: Cache = {
        data: dataSchema.parse(stored.data),
        base: dataSchema.parse(stored.base),
        guestBase: dataSchema.parse(stored.guestBase),
        revision: stored.revision,
      }
      const merged = mergeAccountData(current.guestBase, current.data, guest)
      persist(current)
      if (merged.conflicts.length) {
        const conflict: PendingConflict = { kind: 'guest', base: current.guestBase, remote: guest, revision: current.revision, conflicts: merged.conflicts }
        pendingRef.current = conflict
        setPending(conflict)
        setStatus('Local data needs your attention')
      } else {
        persist({ ...current, data: merged.data, guestBase: guest })
      }
    }
    initialize().catch((failure: unknown) => {
      if (active) setError(`Could not load account data: ${errorMessage(failure)}`)
    })
    return () => {
      active = false
      mounted.current = false
      releaseLock.current?.()
      releaseLock.current = null
    }
  }, [userId, deviceId, persist])

  const sync = useCallback(async () => {
    if (!supabase || !userId || !cacheRef.current || pendingRef.current || syncing.current) return
    syncing.current = true
    try {
      await saving.current
      if (mounted.current) { setError(null); setStatus('Syncing...') }
      const response = await supabase.from('account_tallies').select('data, revision').eq('user_id', userId).maybeSingle()
      if (response.error) throw response.error
      const remote = response.data ? dataSchema.parse(response.data.data) : EMPTY_ACCOUNT_DATA
      const revision: number | null = response.data?.revision ?? null
      const current = cacheRef.current
      if (!current || !mounted.current) return
      const merged = mergeAccountData(current.base, current.data, remote)
      if (merged.conflicts.length) {
        const conflict: PendingConflict = { kind: 'cloud', base: current.base, remote, revision, conflicts: merged.conflicts }
        pendingRef.current = conflict
        setPending(conflict)
        setStatus('Changes need your attention')
        return
      }
      const localAtSend = current.data
      let savedRevision = revision
      if (JSON.stringify(merged.data) !== JSON.stringify(remote) || revision === null) {
        const result = revision === null
          ? await supabase.from('account_tallies').insert({ user_id: userId, data: merged.data, revision: 1 }).select('revision').maybeSingle()
          : await supabase.from('account_tallies').update({ data: merged.data, revision: revision + 1, updated_at: new Date().toISOString() })
            .eq('user_id', userId).eq('revision', revision).select('revision').maybeSingle()
        if (result.error) {
          if (result.error.code === '23505') return
          throw result.error
        }
        if (!result.data) return
        savedRevision = result.data.revision
      }
      const latest = cacheRef.current
      if (!latest || !mounted.current) return
      const afterSend = mergeAccountData(localAtSend, latest.data, merged.data)
      if (afterSend.conflicts.length) {
        persist({ ...latest, base: localAtSend, revision: savedRevision })
        const conflict: PendingConflict = { kind: 'cloud', base: localAtSend, remote: merged.data, revision: savedRevision, conflicts: afterSend.conflicts }
        pendingRef.current = conflict
        setPending(conflict)
        setStatus('Changes need your attention')
      } else {
        const next = { ...latest, data: afterSend.data, base: merged.data, revision: savedRevision }
        if (JSON.stringify(next) !== JSON.stringify(latest)) {
          persist(next)
          await saving.current
        }
        if (mounted.current) setStatus(JSON.stringify(afterSend.data) === JSON.stringify(merged.data) ? 'Synced' : 'Changes waiting to sync')
      }
    } catch (failure) {
      if (mounted.current) {
        setError(`Sync paused: ${errorMessage(failure)}. Your changes remain on this device.`)
        setStatus('Not synced')
      }
    } finally {
      syncing.current = false
    }
  }, [persist, userId])

  useEffect(() => {
    if (!userId || !cache || pending) return
    const timer = window.setTimeout(() => { void sync() }, 800)
    return () => window.clearTimeout(timer)
  }, [userId, cache, pending, sync])

  useEffect(() => {
    if (!userId) return
    const timer = window.setInterval(() => { void sync() }, 10000)
    const onOnline = () => { void sync() }
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', onOnline)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', onOnline)
    }
  }, [userId, sync])

  const resolveConflicts = useCallback((choices: Record<string, 'local' | 'remote'>) => {
    const conflict = pendingRef.current
    const current = cacheRef.current
    if (!conflict || !current) return
    const merged = mergeAccountData(conflict.base, current.data, conflict.remote, choices)
    if (merged.conflicts.length) return
    persist(conflict.kind === 'guest'
      ? { ...current, data: merged.data, guestBase: conflict.remote }
      : { ...current, data: merged.data, base: conflict.remote, revision: conflict.revision })
    pendingRef.current = null
    setPending(null)
    setStatus('Changes waiting to sync')
  }, [persist])

  const setField = useCallback(<K extends keyof AccountData>(field: K, value: AccountData[K] | ((previous: AccountData[K] | undefined) => AccountData[K])) => {
    const current = cacheRef.current
    if (!current || pendingRef.current) return
    const next = typeof value === 'function' ? value(current.data[field]) : value
    persist({ ...current, data: { ...current.data, [field]: next } })
    setStatus('Changes waiting to sync')
  }, [persist])

  return {
    data: cache?.data,
    status, error, pending, resolveConflicts, retry: sync,
    waitForLocal: () => saving.current,
    setTallies: ((value) => setField('tallies', value)) as Setter<AccountData['tallies']>,
    setTallyEvents: ((value) => setField('tallyEvents', value)) as Setter<AccountData['tallyEvents']>,
    setDailyTallyNotes: ((value) => setField('dailyTallyNotes', value)) as Setter<AccountData['dailyTallyNotes']>,
  }
}
