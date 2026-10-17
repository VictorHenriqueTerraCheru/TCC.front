import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useLocalizacao } from '@/features/localizacao'
import { api, dados } from '@/infrastructure/api'

import type { DetalheProblema, ValorExistencia, ValorPersistencia } from '../models/problema'
import { aplicarVotoExistencia, aplicarVotoPersistencia } from '../models/votos'
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

function useMutacaoVoto<Valor>(
  id: string,
  enviar: (valor: Valor) => Promise<DetalheProblema>,
  aplicar: (detalhe: DetalheProblema, valor: Valor) => DetalheProblema,
) {
  const queryClient = useQueryClient()
  const { queryKey } = detalheProblemaQuery(id)

  return useMutation({
    mutationKey: chaveVotos(id),
    mutationFn: enviar,
    onMutate: async (valor) => {
      await queryClient.cancelQueries({ queryKey })
      const anterior = queryClient.getQueryData(queryKey)
      if (anterior) queryClient.setQueryData(queryKey, aplicar(anterior, valor))
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

// PUT /problemas/{id}/votos/existencia
export function useVotarExistencia(id: string) {
  const coordenadas = useCoordenadasDoVoto()
  return useMutacaoVoto<ValorExistencia>(
    id,
    (valor) =>
      api
        .PUT('/problemas/{id}/votos/existencia', {
          params: { path: { id } },
          body: { valor, ...coordenadas() },
        })
        .then(dados),
    aplicarVotoExistencia,
  )
}

// PUT /problemas/{id}/votos/persistencia
export function useVotarPersistencia(id: string) {
  const coordenadas = useCoordenadasDoVoto()
  return useMutacaoVoto<ValorPersistencia>(
    id,
    (valor) =>
      api
        .PUT('/problemas/{id}/votos/persistencia', {
          params: { path: { id } },
          body: { valor, ...coordenadas() },
        })
        .then(dados),
    aplicarVotoPersistencia,
  )
}
