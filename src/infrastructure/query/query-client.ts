import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '../api/api-error'

export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 4xx não melhora tentando de novo; rede e 5xx tentam até 2 vezes.
        retry: (falhas, erro) => !(isApiError(erro) && erro.status < 500) && falhas < 2,
      },
      mutations: { retry: false },
    },
  })
}
