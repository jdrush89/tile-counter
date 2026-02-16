import { useState, useEffect, useCallback, useRef } from 'react'

declare const spark: {
  user: () => Promise<any>
  kv: {
    keys: () => Promise<string[]>
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
    delete: (key: string) => Promise<void>
  }
}

let Capacitor: any = null
let Preferences: any = null
let capacitorLoadAttempted = false
let capacitorLoadPromise: Promise<{ Capacitor: any; Preferences: any }> | null = null

const isCapacitorEnvironment = () => {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor
}

const loadCapacitor = async (): Promise<{ Capacitor: any; Preferences: any }> => {
  if (capacitorLoadAttempted) {
    return { Capacitor, Preferences }
  }
  
  if (capacitorLoadPromise) {
    return capacitorLoadPromise
  }
  
  capacitorLoadPromise = (async () => {
    capacitorLoadAttempted = true
    
    if (!isCapacitorEnvironment()) {
      return { Capacitor: null, Preferences: null }
    }
    
    try {
      const windowCapacitor = (window as any).Capacitor
      if (windowCapacitor) {
        Capacitor = windowCapacitor
        const plugins = windowCapacitor.Plugins
        if (plugins && plugins.Preferences) {
          Preferences = plugins.Preferences
        }
      }
      return { Capacitor, Preferences }
    } catch {
      return { Capacitor: null, Preferences: null }
    }
  })()
  
  return capacitorLoadPromise
}

export const isNativePlatform = () => {
  if (!isCapacitorEnvironment()) return false
  try {
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function') {
      return Capacitor.isNativePlatform()
    }
  } catch {
    return false
  }
  return false
}

export const isSparkPlatform = () => {
  return !isNativePlatform() && typeof spark !== 'undefined'
}

export const getPlatform = () => {
  if (!isCapacitorEnvironment()) return 'web'
  try {
    if (Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform()
    }
  } catch {
    return 'web'
  }
  return 'web'
}

export function useStorage<T>(
  key: string,
  defaultValue: T
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isNative, setIsNative] = useState(false)
  
  const valueRef = useRef<T | undefined>(value)
  valueRef.current = value

  useEffect(() => {
    const loadValue = async () => {
      const { Capacitor: cap, Preferences: prefs } = await loadCapacitor()
      const native = cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()
      setIsNative(native)
      
      if (native && prefs) {
        try {
          const result = await prefs.get({ key })
          if (result.value !== null) {
            setValue(JSON.parse(result.value) as T)
          } else {
            setValue(defaultValue)
          }
        } catch (error) {
          console.error('Error loading from Preferences:', error)
          setValue(defaultValue)
        }
      } else {
        setValue(defaultValue)
      }
      setIsLoaded(true)
    }

    loadValue()
  }, [key])

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T | undefined) => T)) => {
      const resolvedValue = typeof newValue === 'function'
        ? (newValue as (prev: T | undefined) => T)(valueRef.current)
        : newValue

      setValue(resolvedValue)

      if (isNative && Preferences) {
        Preferences.set({
          key,
          value: JSON.stringify(resolvedValue),
        }).catch((error: any) => {
          console.error('Error saving to Preferences:', error)
        })
      }
    },
    [key, isNative]
  )

  return [value, setStoredValue, isLoaded]
}

export function useDeviceUserId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    const getOrCreateDeviceId = async () => {
      const { Capacitor: cap, Preferences: prefs } = await loadCapacitor()
      const native = cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()
      
      if (!native || !prefs) {
        setDeviceId(null)
        return
      }

      try {
        const result = await prefs.get({ key: 'device-user-id' })
        if (result.value) {
          setDeviceId(result.value)
        } else {
          const newId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          await prefs.set({ key: 'device-user-id', value: newId })
          setDeviceId(newId)
        }
      } catch (error) {
        console.error('Error getting device ID:', error)
        setDeviceId(`session-${Date.now()}`)
      }
    }

    getOrCreateDeviceId()
  }, [])

  return deviceId
}

export function usePlatformStorage<T>(
  sparkKey: string,
  defaultValue: T,
  sparkHook?: [T | undefined, (value: T | ((prev: T | undefined) => T)) => void]
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, boolean] {
  const [nativeValue, setNativeValue, nativeLoaded] = useStorage<T>(sparkKey, defaultValue)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    loadCapacitor().then(({ Capacitor: cap }) => {
      setIsNative(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform())
    })
  }, [])

  if (isNative) {
    return [nativeValue, setNativeValue, nativeLoaded]
  }

  if (sparkHook) {
    return [sparkHook[0], sparkHook[1], true]
  }

  return [defaultValue, () => {}, true]
}
