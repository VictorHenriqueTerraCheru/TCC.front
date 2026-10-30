import { distanceMeters, useGeolocation } from '@/features/localizacao'

export const MAX_FOOTER_DISTANCE_M = 2000

export function useDistanceTo(point: { lat: number; lng: number }): number | null {
  const { state, position } = useGeolocation()
  return state === 'granted' && position ? distanceMeters(position, point) : null
}
