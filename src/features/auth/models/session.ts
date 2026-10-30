import type { Schema } from '@/infrastructure/api'

export type AuthResponse = Schema<'AuthResponse'>

export interface Session {
  token: string
  expiresAt: string
  user: AuthResponse['user']
}
