import { useSessaoStore } from '@/features/auth'

/** Simula um usuário logado (o MSW trata qualquer Authorization como o usuário do mock). */
export function entrarComoCidadao() {
  useSessaoStore.getState().entrar({
    token: 'jwt-de-teste',
    expiraEm: new Date(Date.now() + 86_400_000).toISOString(),
    usuario: { id: 'u1', nome: 'Mariana Souza', email: 'mariana@email.com', perfil: 'cidadao' },
  })
}

export function sair() {
  useSessaoStore.getState().sair()
}
