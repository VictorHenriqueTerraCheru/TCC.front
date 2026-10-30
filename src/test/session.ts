import { useSessionStore } from '@/features/auth'

type Role = 'citizen' | 'verifiedCitizen' | 'administrator'

export function loginAs(id: string, name: string, role: Role = 'citizen') {
  useSessionStore.getState().login({
    token: `mock-jwt-${id}`,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    user: { id, name, email: `${id}@tcc.local`, role },
  })
}

export function loginAsCitizen() {
  loginAs('u-citizen1', 'Ana Lima')
}

export function loginAsAdmin() {
  loginAs('u-admin', 'Admin TCC', 'administrator')
}

export function logout() {
  useSessionStore.getState().logout()
}
