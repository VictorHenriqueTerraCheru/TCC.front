import { env } from '../env'

/** URL absoluta de um endpoint da API, igual à que o cliente monta (vale no navegador e no Node). */
export function rota(caminho: string): string {
  return new URL(env.apiUrl + caminho, globalThis.location?.origin ?? 'http://localhost').href
}
