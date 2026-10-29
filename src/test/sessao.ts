import { useSessaoStore } from '@/features/auth'

type Perfil = 'citizen' | 'verifiedCitizen' | 'administrator'

export function entrarComo(id: string, nome: string, perfil: Perfil = 'citizen') {
  useSessaoStore.getState().entrar({
    token: `mock-jwt-${id}`,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    user: { id, name: nome, email: `${id}@tcc.local`, role: perfil },
  })
}

export function entrarComoCidadao() {
  entrarComo('u-cidadao1', 'Ana Lima')
}

export function entrarComoAdmin() {
  entrarComo('u-admin', 'Admin TCC', 'administrator')
}

export function sair() {
  useSessaoStore.getState().sair()
}
