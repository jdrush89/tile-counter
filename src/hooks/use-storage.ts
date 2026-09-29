import { useState, useEffect, useCallback, useRef } from 'react'

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
        try {
          const storedValue = window.localStorage.getItem(key)
          setValue(storedValue === null ? defaultValue : JSON.parse(storedValue) as T)
        } catch (error) {
          console.error('Error loading from localStorage:', error)
          setValue(defaultValue)
        }
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

      valueRef.current = resolvedValue
      setValue(resolvedValue)

      if (isNative && Preferences) {
        Preferences.set({
          key,
          value: JSON.stringify(resolvedValue),
        }).catch((error: any) => {
          console.error('Error saving to Preferences:', error)
        })
      } else {
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue))
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
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
      
      try {
        if (native && prefs) {
          const result = await prefs.get({ key: 'device-user-id' })
          if (result.value) {
            setDeviceId(result.value)
            return
          }

          const newId = createDeviceId()
          await prefs.set({ key: 'device-user-id', value: newId })
          setDeviceId(newId)
        } else {
          const storedId = window.localStorage.getItem('device-user-id')
          if (storedId) {
            setDeviceId(storedId)
            return
          }

          const newId = createDeviceId()
          window.localStorage.setItem('device-user-id', newId)
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

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `device-${crypto.randomUUID()}`
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
