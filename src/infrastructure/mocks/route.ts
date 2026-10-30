import { env } from '../env'

export function route(path: string): string {
  return new URL(env.apiUrl + path, globalThis.location?.origin ?? 'http://localhost').href
}
