import { startWatching, requestLocation, useGeolocationStore } from './geolocation-store'

type Success = (p: GeolocationPosition) => void
type Failure = (e: GeolocationPositionError) => void

const position = {
  coords: { latitude: -22.95, longitude: -43.18, accuracy: 15 },
} as GeolocationPosition
const denied = { code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError

function installBrowser(permissionState: PermissionState | null) {
  const geolocation = {
    getCurrentPosition: vi.fn<(s: Success, f: Failure) => void>(),
    watchPosition: vi.fn<(s: Success, f: Failure) => number>(() => 1),
    clearWatch: vi.fn(),
  }
  const status = {
    state: permissionState,
    addEventListener: vi.fn<(type: string, listener: () => void) => void>(),
    removeEventListener: vi.fn(),
  }
  const permissions = permissionState && { query: vi.fn(() => Promise.resolve(status)) }
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', { ...navigator, geolocation, permissions })
  return Object.assign(geolocation, {
    setPermission(state: PermissionState) {
      status.state = state
      for (const [, listener] of status.addEventListener.mock.calls) listener()
    },
  })
}

describe('geolocation-store', () => {
  let clear: () => void = () => {}

  beforeEach(() => useGeolocationStore.setState({ state: 'checking', position: null }))
  afterEach(() => {
    clear()
    vi.unstubAllGlobals()
  })

  it('is unavailable outside a secure context', () => {
    vi.stubGlobal('isSecureContext', false)
    clear = startWatching()
    expect(useGeolocationStore.getState().state).toBe('unavailable')
  })

  it('with permission already granted, tracks the position without asking', async () => {
    const geo = installBrowser('granted')
    clear = startWatching()

    await vi.waitFor(() => expect(useGeolocationStore.getState().state).toBe('granted'))
    expect(geo.watchPosition).toHaveBeenCalledOnce()
    expect(geo.getCurrentPosition).not.toHaveBeenCalled()

    geo.watchPosition.mock.calls[0]![0](position)
    expect(useGeolocationStore.getState().position).toEqual({
      lat: -22.95,
      lng: -43.18,
      accuracy: 15,
    })
  })

  it('in prompt, does not track until the user asks', async () => {
    const geo = installBrowser('prompt')
    clear = startWatching()

    await vi.waitFor(() => expect(useGeolocationStore.getState().state).toBe('prompt'))
    expect(geo.watchPosition).not.toHaveBeenCalled()

    const request = requestLocation()
    geo.getCurrentPosition.mock.calls[0]![0](position)

    await expect(request).resolves.toEqual({ lat: -22.95, lng: -43.18, accuracy: 15 })
    expect(useGeolocationStore.getState().state).toBe('granted')
    expect(geo.watchPosition).toHaveBeenCalledOnce()
  })

  it('remembers that permission was granted', async () => {
    installBrowser('granted')
    clear = startWatching()

    await vi.waitFor(() => expect(useGeolocationStore.getState().state).toBe('granted'))
    expect(localStorage.getItem('ocorrencias.localizacaoConcedida')).toBe('1')
  })

  it('in prompt, if it was granted before (iOS forgets), asks again without waiting for Ativar', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = installBrowser('prompt')
    clear = startWatching()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    expect(useGeolocationStore.getState().state).toBe('checking')

    geo.getCurrentPosition.mock.calls[0]![0](position)
    expect(useGeolocationStore.getState()).toMatchObject({
      state: 'granted',
      position: { lat: -22.95, lng: -43.18, accuracy: 15 },
    })
    expect(geo.watchPosition).toHaveBeenCalledOnce()
  })

  it('app open: if iOS moves the permission back to prompt, asks again instead of the banner', async () => {
    const geo = installBrowser('granted')
    clear = startWatching()
    await vi.waitFor(() => expect(useGeolocationStore.getState().state).toBe('granted'))

    geo.setPermission('prompt')

    expect(geo.getCurrentPosition).toHaveBeenCalledOnce()
    expect(useGeolocationStore.getState().state).not.toBe('prompt')
    expect(geo.clearWatch).toHaveBeenCalledWith(1)
    expect(geo.clearWatch.mock.invocationCallOrder[0]).toBeLessThan(
      geo.getCurrentPosition.mock.invocationCallOrder[0]!,
    )
  })

  it('if the automatic request is denied, forgets the grant and stays denied', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = installBrowser('prompt')
    clear = startWatching()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    geo.getCurrentPosition.mock.calls[0]![1](denied)

    expect(useGeolocationStore.getState()).toMatchObject({ state: 'denied', position: null })
    expect(localStorage.getItem('ocorrencias.localizacaoConcedida')).toBeNull()
  })

  it('if the automatic request fails for another reason, goes back to prompt', async () => {
    localStorage.setItem('ocorrencias.localizacaoConcedida', '1')
    const geo = installBrowser('prompt')
    clear = startWatching()

    await vi.waitFor(() => expect(geo.getCurrentPosition).toHaveBeenCalledOnce())
    geo.getCurrentPosition.mock.calls[0]![1]({
      code: 3,
      PERMISSION_DENIED: 1,
    } as GeolocationPositionError)

    await vi.waitFor(() => expect(useGeolocationStore.getState().state).toBe('prompt'))
  })

  it('denied request becomes denied and resolves null', async () => {
    const geo = installBrowser(null)
    clear = startWatching()
    expect(useGeolocationStore.getState().state).toBe('prompt')

    const request = requestLocation()
    geo.getCurrentPosition.mock.calls[0]![1](denied)

    await expect(request).resolves.toBeNull()
    expect(useGeolocationStore.getState()).toMatchObject({ state: 'denied', position: null })
  })
})
