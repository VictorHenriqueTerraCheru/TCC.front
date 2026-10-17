import type { components } from './schema'

type ProblemDetails = components['schemas']['HttpValidationProblemDetails']

/**
 * Erro HTTP da API, montado a partir do ProblemDetails (RFC 9457).
 * `type` é o código estável de docs/API.md (ex.: 'email-ja-cadastrado'); 400/401/403/404 podem vir sem ele.
 * Falha de rede não vira ApiError: o fetch lança TypeError (tela 26 trata à parte).
 */
export class ApiError extends Error {
  readonly status: number
  readonly type: string | null
  readonly title: string | null
  readonly errors: Record<string, string[]>

  constructor(status: number, problema?: ProblemDetails | null) {
    super(problema?.title ?? `Erro HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.type = problema?.type ?? null
    this.title = problema?.title ?? null
    this.errors = problema?.errors ?? {}
  }

  /** Primeira mensagem de validação do campo (camelCase, como a API devolve). */
  erroDoCampo(campo: string): string | undefined {
    return this.errors[campo]?.[0]
  }
}

export function isApiError(erro: unknown): erro is ApiError {
  return erro instanceof ApiError
}

export function isErroDeRede(erro: unknown): boolean {
  return erro instanceof TypeError || (erro instanceof DOMException && erro.name === 'AbortError')
}
