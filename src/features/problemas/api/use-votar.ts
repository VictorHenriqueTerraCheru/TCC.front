import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useLocalizacao } from '@/features/localizacao'
import { api, dados } from '@/infrastructure/api'

import type { ValorVoto } from '../models/problema'
import { aplicarVoto } from '../models/votos'
import { detalheProblemaQuery } from './use-detalhe-problema'

function useCoordenadasDoVoto() {
  const { estado, posicao } = useLocalizacao()
  return () =>
    estado === 'granted' && posicao
      ? { lat: posicao.lat, lng: posicao.lng }
      : { lat: null, lng: null }
}

export const chaveVotos = (id: string) => ['votes', id] as const

export function useVotar(id: string) {
  const queryClient = useQueryClient()
  const coordenadas = useCoordenadasDoVoto()
  const { queryKey } = detalheProblemaQuery(id)

  return useMutation({
    mutationKey: chaveVotos(id),
    mutationFn: (valor: ValorVoto) =>
      api
        .PUT('/issues/{id}/vote', {
          params: { path: { id } },
          body: { value: valor, ...coordenadas() },
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
    onSuccess: (detalhe) => queryClient.setQueryData(queryKey, detalhe),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['problemas', 'area'] }),
  })
}
