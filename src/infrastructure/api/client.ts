import createClient, { type Middleware } from 'openapi-fetch'

import { env } from '../env'
import { ApiError } from './api-error'
import { getAuthProvider } from './autenticacao'
import type { paths } from './schema'

const baseUrl = new URL(env.apiUrl, globalThis.location?.origin ?? 'http://localhost').href.replace(
  /\/$/,
  '',
)

const PUBLIC_AUTH_ROUTES = /^\/auth\//

const authentication: Middleware = {
  onRequest({ request, schemaPath }) {
    if (PUBLIC_AUTH_ROUTES.test(schemaPath)) return
    const token = getAuthProvider().getToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
  onResponse({ request, response }) {
    const sent = request.headers.get('Authorization')
    if (
      response.status === 401 &&
      sent !== null &&
      sent === `Bearer ${getAuthProvider().getToken()}`
    ) {
      getAuthProvider().onSessionExpired()
    }
  },
}

export const api = createClient<paths>({ baseUrl, fetch: (request) => globalThis.fetch(request) })
api.use(authentication)

interface Result {
  data?: unknown
  error?: unknown
  response: Response
}

export function unwrapData<R extends Result>(result: R): Exclude<R['data'], undefined> {
  verify(result)
  return result.data as Exclude<R['data'], undefined>
}

export function unwrapEmpty(result: Result): void {
  verify(result)
}

function verify({ error, response }: Result) {
  if (error !== undefined || !response.ok) {
    throw new ApiError(response.status, error as ConstructorParameters<typeof ApiError>[1])
  }
}
