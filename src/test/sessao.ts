import { useSessaoStore } from '@/features/auth'

type Perfil = 'cidadao' | 'cidadaoVerificado' | 'administrador'

/**
 * Simula login. O MSW identifica o usuário pelo token "mock-jwt-<id>" (outros tokens = cidadao1);
 * ids e nomes iguais a src/infrastructure/mocks/fixtures/usuarios.ts.
 */
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
