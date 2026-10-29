import type { Schema } from '@/infrastructure/api'

export type RespostaAuth = Schema<'RespostaAuth'>

export interface Sessao {
  token: string
  expiraEm: string
  usuario: RespostaAuth['usuario']
}
