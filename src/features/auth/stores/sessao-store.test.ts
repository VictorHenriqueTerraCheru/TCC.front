import { loginAsCitizen } from '@/test/sessao'

import { useGuardStore } from './guarda-store'
import { authProvider, currentSession, useSessionStore } from './sessao-store'

const HOUR = 3_600_000

function loginExpiring(inMs: number) {
  useSessionStore.getState().login({
    token: 'jwt-test',
    expiresAt: new Date(Date.now() + inMs).toISOString(),
    user: { id: 'u-1', name: 'Ana', email: 'ana@tcc.local', role: 'citizen' },
  })
}

beforeEach(() => {
  useSessionStore.setState({ session: null })
  useGuardStore.setState({ reason: null, expired: false, pendingAction: null })
})

describe('session (rules 11 and 13)', () => {
  it('currentSession returns the session while it is valid', () => {
    loginExpiring(HOUR)

    expect(currentSession()?.token).toBe('jwt-test')
    expect(useGuardStore.getState().expired).toBe(false)
  })

  it('currentSession without session returns null and does not mark expiration', () => {
    expect(currentSession()).toBeNull()
    expect(useGuardStore.getState().expired).toBe(false)
  })

  it('currentSession clears the expired session and marks the expiration for the guard', () => {
    loginExpiring(-1000)

    expect(currentSession()).toBeNull()
    expect(useSessionStore.getState().session).toBeNull()
    expect(useGuardStore.getState().expired).toBe(true)
  })

  it('expiresAt exactly now already counts as expired', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-10-20T12:00:00Z'))
      useSessionStore.getState().login({
        token: 'jwt-test',
        expiresAt: '2026-10-20T12:00:00Z',
        user: { id: 'u-1', name: 'Ana', email: 'ana@tcc.local', role: 'citizen' },
      })

      expect(currentSession()).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('the provider hands the token of the valid session and null for a guest or expired session', () => {
    expect(authProvider.getToken()).toBeNull()

    loginExpiring(HOUR)
    expect(authProvider.getToken()).toBe('jwt-test')

    loginExpiring(-1000)
    expect(authProvider.getToken()).toBeNull()
  })

  it('onSessionExpired (401) clears the session and marks the expiration', () => {
    loginAsCitizen()

    authProvider.onSessionExpired()

    expect(useSessionStore.getState().session).toBeNull()
    expect(useGuardStore.getState().expired).toBe(true)
  })

  it('logout does not mark expiration (only expiry does)', () => {
    loginAsCitizen()

    useSessionStore.getState().logout()

    expect(useGuardStore.getState().expired).toBe(false)
  })

  it('the session is saved in localStorage', () => {
    loginExpiring(HOUR)

    const stored = JSON.parse(localStorage.getItem('ocorrencias.sessao') ?? '{}')
    expect(stored.state.session.token).toBe('jwt-test')
  })
})
