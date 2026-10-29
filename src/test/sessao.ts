import { useSessaoStore } from '@/features/auth'

type Perfil = 'cidadao' | 'cidadaoVerificado' | 'administrador'

export function entrarComo(id: string, nome: string, perfil: Perfil = 'cidadao') {
  useSessaoStore.getState().entrar({
    token: `mock-jwt-${id}`,
    expiraEm: new Date(Date.now() + 86_400_000).toISOString(),
    usuario: { id, nome, email: `${id}@tcc.local`, perfil },
  })
}

export function entrarComoCidadao() {
  entrarComo('u-cidadao1', 'Ana Lima')
}

export function entrarComoAdmin() {
  entrarComo('u-admin', 'Admin TCC', 'administrador')
}

export function sair() {
  useSessaoStore.getState().sair()
}
