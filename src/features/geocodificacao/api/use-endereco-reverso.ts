import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados, isApiError } from '@/infrastructure/api'

import { enderecoIndisponivel } from '../models/endereco'

const arredondar = (valor: number) => Math.round(valor * 10_000) / 10_000

export function enderecoReversoQuery(lat: number, lng: number) {
  const ponto = { lat: arredondar(lat), lng: arredondar(lng) }
  return queryOptions({
    queryKey: ['geocodificacao', 'reversa', ponto],
    queryFn: async ({ signal }) => {
      try {
        return await api
          .GET('/geocodificacao/reversa', { params: { query: ponto }, signal })
          .then(dados)
      } catch (erro) {
        if (isApiError(erro) && erro.status === 429)
          return enderecoIndisponivel(ponto.lat, ponto.lng)
        throw erro
      }
    },
    staleTime: Infinity,
  })
}

export function useEnderecoReverso(ponto: { lat: number; lng: number } | null) {
  return useQuery({
    ...enderecoReversoQuery(ponto?.lat ?? 0, ponto?.lng ?? 0),
    enabled: ponto !== null,
  })
}
