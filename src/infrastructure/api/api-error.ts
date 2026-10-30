import type { components } from './schema'

type ProblemDetails = components['schemas']['HttpValidationProblemDetails']

export class ApiError extends Error {
  readonly status: number
  readonly type: string | null
  readonly title: string | null
  readonly errors: Record<string, string[]>

  constructor(status: number, issue?: ProblemDetails | null) {
    super(issue?.title ?? `Erro HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.type = issue?.type ?? null
    this.title = issue?.title ?? null
    this.errors = issue?.errors ?? {}
  }

  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof DOMException &&
      (error.name === 'AbortError' || error.name === 'TimeoutError'))
  )
}
