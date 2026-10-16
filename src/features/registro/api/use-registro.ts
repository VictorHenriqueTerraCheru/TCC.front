import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import type { Ponto } from '../stores/rascunho-store'

/** Sem resposta em 20 s, o envio vira falha de rede (tela 26) e o rascunho continua. */
const TEMPO_LIMITE_ENVIO_MS = 20_000

// GET /problemas/duplicatas — mesma categoria, não resolvidos, até 50 m.
export function duplicatasQuery(categoriaId: number, { lat, lng }: Ponto) {
  return queryOptions({
    queryKey: ['problemas', 'duplicatas', { categoriaId, lat, lng }],
    queryFn: ({ signal }) =>
      api
        .GET('/problemas/duplicatas', { params: { query: { categoriaId, lat, lng } }, signal })
        .then(dados),
    staleTime: 60_000,
  })
}

interface NovoProblema extends Ponto {
  categoriaId: number
  descricao: string
}

// POST /problemas — o endereço é obtido pela API (não vai no corpo).
export function useRegistrarProblema() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoriaId, lat, lng, descricao }: NovoProblema) =>
      api
        .POST('/problemas', {
          body: { categoriaId, lat, lng, descricao: descricao.trim() || null },
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
  categoriaId: number
  ocorridoEm: Date
}

// POST /incidentes — devolve o resumo da área (GET /incidentes/area do ponto arredondado).
export function useRegistrarIncidente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoriaId, lat, lng, ocorridoEm }: NovoIncidente) =>
      api
        .POST('/incidentes', {
          body: { categoriaId, lat, lng, ocorridoEm: ocorridoEm.toISOString() },
          signal: AbortSignal.timeout(TEMPO_LIMITE_ENVIO_MS),
        })
        .then(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidentes'] }),
  })
}
