export { api, unwrapData, unwrapEmpty } from './client'
export { ApiError, isApiError, isNetworkError } from './api-error'
export { registerAuthProvider, type AuthProvider } from './autenticacao'
export type { components, paths } from './schema'

import type { components } from './schema'

export type Schema<Nome extends keyof components['schemas']> = components['schemas'][Nome]
