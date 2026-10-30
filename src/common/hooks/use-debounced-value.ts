import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [delayed, setDelayed] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return delayed
}
