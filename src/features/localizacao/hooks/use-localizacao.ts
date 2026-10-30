import { useEffect } from 'react'

import { startWatching, requestLocation, useGeolocationStore } from '../stores/localizacao-store'

export function useGeolocation() {
  const state = useGeolocationStore((s) => s.state)
  const position = useGeolocationStore((s) => s.position)
  return { state, position, request: requestLocation }
}

export function useWatchLocation() {
  useEffect(() => startWatching(), [])
}
