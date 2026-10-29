import type { Schema } from '@/infrastructure/api'

export type RespostaAuth = Schema<'AuthResponse'>

export interface Sessao {
  token: string
  expiresAt: string
  user: RespostaAuth['user']
}
