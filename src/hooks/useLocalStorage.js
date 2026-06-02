import { useState, useEffect } from 'react'

/**
 * Persistenter State über localStorage (JSON-serialisiert).
 * Verhält sich wie useState, schreibt aber bei jeder Änderung in localStorage.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Speicher voll / nicht verfügbar – still ignorieren */
    }
  }, [key, value])

  return [value, setValue]
}
