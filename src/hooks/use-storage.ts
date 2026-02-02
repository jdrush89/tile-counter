import { useState, useEffect, useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

// Check if we're running in a native app context
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform()
}

// Check if we're running in Spark (web) context  
export const isSparkPlatform = () => {
  return !Capacitor.isNativePlatform() && typeof spark !== 'undefined'
}

// Get the current platform name
export const getPlatform = () => {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() // 'android' | 'ios'
  }
  return 'web'
}

/**
 * A universal storage hook that works both in Spark (web) and native mobile apps.
 * - In Spark: Uses the spark KV store tied to the user's GitHub account
 * - In Native (Android/iOS): Uses Capacitor Preferences for local device storage
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, boolean] {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  const isNative = isNativePlatform()
  
  // Keep track of the latest value for the setter callback
  const valueRef = useRef<T | undefined>(value)
  valueRef.current = value

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      if (isNative) {
        // Native platform: use Capacitor Preferences
        try {
          const result = await Preferences.get({ key })
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
        // Spark platform: we'll let the component use useKV directly
        // This hook is mainly for native, but we provide a fallback
        setValue(defaultValue)
      }
      setIsLoaded(true)
    }

    loadValue()
  }, [key, isNative]) // eslint-disable-line react-hooks/exhaustive-deps

  // Setter function
  const setStoredValue = useCallback(
    (newValue: T | ((prev: T | undefined) => T)) => {
      const resolvedValue = typeof newValue === 'function'
        ? (newValue as (prev: T | undefined) => T)(valueRef.current)
        : newValue

      setValue(resolvedValue)

      if (isNative) {
        // Save to Capacitor Preferences
        Preferences.set({
          key,
          value: JSON.stringify(resolvedValue),
        }).catch((error) => {
          console.error('Error saving to Preferences:', error)
        })
      }
    },
    [key, isNative]
  )

  return [value, setStoredValue, isLoaded]
}

/**
 * Hook to get a device-specific user ID for native platforms.
 * This provides a consistent identifier for storing user data locally.
 */
export function useDeviceUserId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    const getOrCreateDeviceId = async () => {
      if (!isNativePlatform()) {
        setDeviceId(null)
        return
      }

      try {
        const result = await Preferences.get({ key: 'device-user-id' })
        if (result.value) {
          setDeviceId(result.value)
        } else {
          // Generate a new device ID
          const newId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          await Preferences.set({ key: 'device-user-id', value: newId })
          setDeviceId(newId)
        }
      } catch (error) {
        console.error('Error getting device ID:', error)
        // Fallback to a session-based ID
        setDeviceId(`session-${Date.now()}`)
      }
    }

    getOrCreateDeviceId()
  }, [])

  return deviceId
}

/**
 * Combined hook that provides the appropriate storage mechanism
 * based on the platform (Spark vs Native).
 */
export function usePlatformStorage<T>(
  sparkKey: string,
  defaultValue: T,
  sparkHook?: [T | undefined, (value: T | ((prev: T | undefined) => T)) => void]
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, boolean] {
  const isNative = isNativePlatform()
  const [nativeValue, setNativeValue, nativeLoaded] = useStorage<T>(sparkKey, defaultValue)

  if (isNative) {
    return [nativeValue, setNativeValue, nativeLoaded]
  }

  // For Spark, use the provided hook or return defaults
  if (sparkHook) {
    return [sparkHook[0], sparkHook[1], true]
  }

  return [defaultValue, () => {}, true]
}
