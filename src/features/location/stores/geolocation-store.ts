import { create } from 'zustand'

export type LocationStatus = 'checking' | 'prompt' | 'granted' | 'denied' | 'unavailable'

export interface Position {
  lat: number
  lng: number
  accuracy: number
}

interface GeolocationState {
  state: LocationStatus
  position: Position | null
}

export const useGeolocationStore = create<GeolocationState>()(() => ({
  state: 'checking',
  position: null,
}))

const OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 }

let watchId: number | null = null

function toPosition({ coords }: GeolocationPosition): Position {
  return { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }
}

function available(): boolean {
  return globalThis.isSecureContext === true && 'geolocation' in navigator
}

function trackPosition() {
  if (watchId !== null) return
  watchId = navigator.geolocation.watchPosition(
    (position) =>
      useGeolocationStore.setState({ state: 'granted', position: toPosition(position) }),
    (error) => {
      if (error.code === error.PERMISSION_DENIED) applyState('denied')
    },
    OPTIONS,
  )
}

function stopTracking() {
  if (watchId === null) return
  navigator.geolocation.clearWatch(watchId)
  watchId = null
}

const GRANTED_KEY = 'urbanReports.locationGranted'

function grantedBefore(): boolean {
  try {
    return localStorage.getItem(GRANTED_KEY) === '1'
  } catch {
    return false
  }
}

function rememberGrant(granted: boolean) {
  try {
    if (granted) localStorage.setItem(GRANTED_KEY, '1')
    else localStorage.removeItem(GRANTED_KEY)
  } catch {
    void 0
  }
}

function applyState(state: LocationStatus) {
  if (state === 'granted') {
    rememberGrant(true)
    useGeolocationStore.setState({ state })
    trackPosition()
  } else {
    if (state === 'denied') rememberGrant(false)
    stopTracking()
    useGeolocationStore.setState({ state, position: null })
  }
}

export function startWatching(): () => void {
  if (!available()) {
    applyState('unavailable')
    return () => {}
  }

  let status: PermissionStatus | null = null
  let cancelled = false
  const applyPermission = (state: PermissionState) => {
    if (state !== 'prompt' || !grantedBefore()) return applyState(state)
    stopTracking()
    useGeolocationStore.setState({ state: 'checking' })
    void requestLocation().then((position) => {
      if (!position && !cancelled && useGeolocationStore.getState().state === 'checking')
        applyState('prompt')
    })
  }
  const onChange = () => status && applyPermission(status.state)

  if (navigator.permissions?.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return
        status = result
        status.addEventListener('change', onChange)
        applyPermission(status.state)
      })
      .catch(() => !cancelled && applyPermission('prompt'))
  } else {
    applyPermission('prompt')
  }

  return () => {
    cancelled = true
    status?.removeEventListener('change', onChange)
    stopTracking()
  }
}

export function requestLocation(): Promise<Position | null> {
  if (!available()) return Promise.resolve(null)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const position = toPosition(result)
        useGeolocationStore.setState({ position })
        applyState('granted')
        resolve(position)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) applyState('denied')
        resolve(null)
      },
      OPTIONS,
    )
  })
}
