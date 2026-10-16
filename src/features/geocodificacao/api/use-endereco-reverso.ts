import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados, isApiError } from '@/infrastructure/api'

import { enderecoIndisponivel } from '../models/endereco'

// A API guarda em cache por coordenada em 4 casas (~11 m): a chave segue o mesmo arredondamento.
const arredondar = (valor: number) => Math.round(valor * 10_000) / 10_000

// GET /geocodificacao/reversa — sempre pela API, nunca o Nominatim direto (regra 4).
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
        // Regra 17: 429 limite-requisicoes = endereço indisponível, nunca erro bloqueante.
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
