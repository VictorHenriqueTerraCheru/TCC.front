import { env } from '../env'

export function rota(caminho: string): string {
  return new URL(env.apiUrl + caminho, globalThis.location?.origin ?? 'http://localhost').href
}
