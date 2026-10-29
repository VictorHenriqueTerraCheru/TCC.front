import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import type { Ponto } from '../stores/rascunho-store'

const TEMPO_LIMITE_ENVIO_MS = 20_000

export function duplicatasQuery(categoriaId: number, { lat, lng }: Ponto) {
  return queryOptions({
    queryKey: ['problemas', 'duplicatas', { categoryId: categoriaId, lat, lng }],
    queryFn: ({ signal }) =>
      api
        .GET('/issues/duplicates', {
          params: { query: { categoryId: categoriaId, lat, lng } },
          signal,
        })
        .then(dados),
    staleTime: 60_000,
  })
}

interface NovoProblema extends Ponto {
  categoryId: number
  description: string
}

export function useRegistrarProblema() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId: categoriaId, lat, lng, description: descricao }: NovoProblema) =>
      api
        .POST('/issues', {
          body: { categoryId: categoriaId, lat, lng, description: descricao.trim() || null },
          signal: AbortSignal.timeout(TEMPO_LIMITE_ENVIO_MS),
        })
        .then(dados),
    onSuccess: (detalhe) => {
      queryClient.setQueryData(['problemas', 'detalhe', detalhe.id], detalhe)
      void queryClient.invalidateQueries({ queryKey: ['problemas', 'area'] })
    },
  })
}

interface NovoIncidente extends Ponto {
  categoryId: number
  occurredAt: Date
}

export function useRegistrarIncidente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId: categoriaId, lat, lng, occurredAt: ocorridoEm }: NovoIncidente) =>
      api
        .POST('/incidents', {
          body: { categoryId: categoriaId, lat, lng, occurredAt: ocorridoEm.toISOString() },
          signal: AbortSignal.timeout(TEMPO_LIMITE_ENVIO_MS),
        })
        .then(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidentes'] }),
  })
}
