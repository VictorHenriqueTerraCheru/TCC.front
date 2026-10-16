import createClient, { type Middleware } from 'openapi-fetch'

import { env } from '../env'
import { ApiError } from './api-error'
import { obterProvedorAutenticacao } from './autenticacao'
import type { paths } from './schema'

// openapi-fetch monta `new Request(baseUrl + path)`; no Node (testes) a URL precisa ser absoluta.
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
    if (response.status === 401 && request.headers.has('Authorization')) {
      obterProvedorAutenticacao().aoExpirarSessao()
    }
  },
}

// fetch resolvido a cada chamada: interceptadores (MSW) instalados depois da importação continuam valendo.
export const api = createClient<paths>({ baseUrl, fetch: (request) => globalThis.fetch(request) })
api.use(autenticacao)

interface Resultado {
  data?: unknown
  error?: unknown
  response: Response
}

/**
 * Devolve o corpo de sucesso ou lança ApiError. Os hooks de api/ das features usam assim:
 * `queryFn: () => api.GET('/categorias').then(dados)`.
 * Para respostas 204 (sem corpo), use `semConteudo`.
 */
export function dados<R extends Resultado>(resultado: R): Exclude<R['data'], undefined> {
  verificar(resultado)
  return resultado.data as Exclude<R['data'], undefined>
}

/** Para endpoints 204: lança ApiError em falha e não devolve nada. */
export function semConteudo(resultado: Resultado): void {
  verificar(resultado)
}

function verificar({ error, response }: Resultado) {
  if (error !== undefined || !response.ok) {
    throw new ApiError(response.status, error as ConstructorParameters<typeof ApiError>[1])
  }
}
