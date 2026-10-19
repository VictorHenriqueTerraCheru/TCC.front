import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useLocalizacao } from '@/features/localizacao'
import { api, dados } from '@/infrastructure/api'

import type { ValorVoto } from '../models/problema'
import { aplicarVoto } from '../models/votos'
import { detalheProblemaQuery } from './use-detalhe-problema'

/** lat/lng vão juntos ou nenhum; sem permissão, o voto tem peso de proximidade 1 (regra 2). */
function useCoordenadasDoVoto() {
  const { estado, posicao } = useLocalizacao()
  return () =>
    estado === 'granted' && posicao
      ? { lat: posicao.lat, lng: posicao.lng }
      : { lat: null, lng: null }
}

/** Todas as mutações de voto de um problema: o card rápido e o detalhe compartilham o bloqueio. */
export const chaveVotos = (id: string) => ['votos', id] as const

// PUT /problemas/{id}/voto
export function useVotar(id: string) {
  const queryClient = useQueryClient()
  const coordenadas = useCoordenadasDoVoto()
  const { queryKey } = detalheProblemaQuery(id)

  return useMutation({
    mutationKey: chaveVotos(id),
    mutationFn: (valor: ValorVoto) =>
      api
        .PUT('/problemas/{id}/voto', {
          params: { path: { id } },
          body: { valor, ...coordenadas() },
        })
        .then(dados),
    onMutate: async (valor) => {
      await queryClient.cancelQueries({ queryKey })
      const anterior = queryClient.getQueryData(queryKey)
      if (anterior) queryClient.setQueryData(queryKey, aplicarVoto(anterior, valor))
      return { anterior }
    },
    onError: (_erro, _valor, contexto) => {
      if (contexto?.anterior) queryClient.setQueryData(queryKey, contexto.anterior)
      void queryClient.invalidateQueries({ queryKey })
    },
    // A resposta do PUT já é o detalhe recalculado (confiança e ciclo de vida).
    onSuccess: (detalhe) => queryClient.setQueryData(queryKey, detalhe),
    // O voto pode mudar faixa e status: os marcadores do mapa precisam recarregar.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['problemas', 'area'] }),
  })
}
