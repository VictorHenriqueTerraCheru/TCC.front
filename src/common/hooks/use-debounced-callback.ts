import { useEffect, useMemo, useRef } from 'react'

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  atrasoMs: number,
) {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return useMemo(
    () =>
      (...args: Args) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => callbackRef.current(...args), atrasoMs)
      },
    [atrasoMs],
  )
}
