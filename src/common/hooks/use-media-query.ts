import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const medium = window.matchMedia(query)
      medium.addEventListener('change', notify)
      return () => medium.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
