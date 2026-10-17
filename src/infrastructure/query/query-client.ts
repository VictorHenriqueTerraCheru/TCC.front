import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '../api/api-error'

export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // navigator.onLine é só uma dica (docs/TELAS.md, tela 26): sempre tenta a rede, em vez
        // de pausar quando o navegador se diz offline.
        networkMode: 'always',
        // 4xx não melhora tentando de novo; rede e 5xx tentam até 2 vezes.
        retry: (falhas, erro) => !(isApiError(erro) && erro.status < 500) && falhas < 2,
      },
      // Offline, o envio falha na hora e abre "Não foi possível enviar" (o modo padrão pausaria
      // a mutação e o botão ficaria em "Enviando…").
      mutations: { retry: false, networkMode: 'always' },
    },
  })
}
