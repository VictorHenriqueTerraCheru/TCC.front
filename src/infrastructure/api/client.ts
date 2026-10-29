import createClient, { type Middleware } from 'openapi-fetch'

import { env } from '../env'
import { ApiError } from './api-error'
import { obterProvedorAutenticacao } from './autenticacao'
import type { paths } from './schema'

const baseUrl = new URL(env.apiUrl, globalThis.location?.origin ?? 'http://localhost').href.replace(
  /\/$/,
  '',
)

const ROTAS_PUBLICAS_DE_AUTH = /^\/auth\//

const autenticacao: Middleware = {
  onRequest({ request, schemaPath }) {
    if (ROTAS_PUBLICAS_DE_AUTH.test(schemaPath)) return
    const token = obterProvedorAutenticacao().obterToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  onResponse({ request, response }) {
    const enviado = request.headers.get('Authorization')
    if (
      response.status === 401 &&
      enviado !== null &&
      enviado === `Bearer ${obterProvedorAutenticacao().obterToken()}`
    ) {
      obterProvedorAutenticacao().aoExpirarSessao()
    }
  },
}

export const api = createClient<paths>({ baseUrl, fetch: (request) => globalThis.fetch(request) })
api.use(autenticacao)

interface Resultado {
  data?: unknown
  error?: unknown
  response: Response
}

export function dados<R extends Resultado>(resultado: R): Exclude<R['data'], undefined> {
  verificar(resultado)
  return resultado.data as Exclude<R['data'], undefined>
}

export function semConteudo(resultado: Resultado): void {
  verificar(resultado)
}

function verificar({ error, response }: Resultado) {
  if (error !== undefined || !response.ok) {
    throw new ApiError(response.status, error as ConstructorParameters<typeof ApiError>[1])
  }
}
