import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData, isApiError } from '@/infrastructure/api'

import { addressUnavailable } from '../models/endereco'

const round = (value: number) => Math.round(value * 10_000) / 10_000

export function reverseGeocodeQuery(lat: number, lng: number) {
  const point = { lat: round(lat), lng: round(lng) }
  return queryOptions({
    queryKey: ['geocoding', 'reverse', point],
    queryFn: async ({ signal }) => {
      try {
        return await api
          .GET('/geocoding/reverse', { params: { query: point }, signal })
          .then(unwrapData)
      } catch (error) {
        if (isApiError(error) && error.status === 429)
          return addressUnavailable(point.lat, point.lng)
        throw error
      }
    },
    staleTime: Infinity,
  })
}

export function useReverseGeocode(point: { lat: number; lng: number } | null) {
  return useQuery({
    ...reverseGeocodeQuery(point?.lat ?? 0, point?.lng ?? 0),
    enabled: point !== null,
  })
}
