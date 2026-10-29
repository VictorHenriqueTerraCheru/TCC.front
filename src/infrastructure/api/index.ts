export { api, dados, semConteudo } from './client'
export { ApiError, isApiError, isErroDeRede } from './api-error'
export { registrarAutenticacao, type ProvedorAutenticacao } from './autenticacao'
export type { components, paths } from './schema'

import type { components } from './schema'

export type Schema<Nome extends keyof components['schemas']> = components['schemas'][Nome]
