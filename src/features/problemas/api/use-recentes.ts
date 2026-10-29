import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

const TAMANHO_PAGINA = 20
export const RAIO_RECENTES_KM = 10

const arredondar = (valor: number) => Math.round(valor * 1000) / 1000

export function recentesQuery(centro: { lat: number; lng: number }, grupos: string[]) {
  const ponto = { lat: arredondar(centro.lat), lng: arredondar(centro.lng) }
  return infiniteQueryOptions({
    queryKey: ['problemas', 'recentes', ponto, { grupos }],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/problemas/recentes', {
          params: {
            query: {
              ...ponto,
              raioKm: RAIO_RECENTES_KM,
              grupos: grupos.length ? grupos.join(',') : undefined,
              pagina: pageParam,
              tamanho: TAMANHO_PAGINA,
            },
          },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ pagina, tamanho, total }) =>
      pagina * tamanho < total ? pagina + 1 : undefined,
  })
}

export function useRecentes(centro: { lat: number; lng: number }, grupos: string[]) {
  return useInfiniteQuery(recentesQuery(centro, grupos))
}
