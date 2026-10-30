import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthProvider } from '@/infrastructure/api'

import type { AuthResponse, Session } from '../models/session'
import { useGuardStore } from './guard-store'

interface SessionState {
  session: Session | null
  login(response: AuthResponse): void
  logout(): void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      login: ({ token, expiresAt, user }) => set({ session: { token, expiresAt, user } }),
      logout: () => set({ session: null }),
    }),
    {
      name: 'ocorrencias.sessao',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.session && expired(state.session)) {
          state.logout()
          useGuardStore.setState({ expired: true })
        }
      },
    },
  ),
)

function expired(session: Session): boolean {
  return Date.parse(session.expiresAt) <= Date.now()
}

export function currentSession(): Session | null {
  const { session, logout } = useSessionStore.getState()
  if (!session) return null
  if (expired(session)) {
    logout()
    useGuardStore.setState({ expired: true })
    return null
  }
  return session
}

export const authProvider: AuthProvider = {
  getToken() {
    return currentSession()?.token ?? null
  },
  onSessionExpired() {
    useSessionStore.getState().logout()
    useGuardStore.setState({ expired: true })
  },
}

export function useAuthenticated(): boolean {
  return useSessionStore((s) => s.session !== null)
}
