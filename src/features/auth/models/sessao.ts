import type { Schema } from '@/infrastructure/api'

export type RespostaAuth = Schema<'RespostaAuth'>

/** O que fica guardado do login/cadastro. O perfil atual vem de GET /me (regra 14), não daqui. */
export interface Sessao {
  token: string
  expiraEm: string
  usuario: RespostaAuth['usuario']
}
