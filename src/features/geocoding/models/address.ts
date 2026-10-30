import type { Schema } from '@/infrastructure/api'

export type ReverseGeocode = Schema<'ReverseResponse'>

export function addressUnavailable(lat: number, lng: number): ReverseGeocode {
  return {
    available: false,
    address: `Próximo a ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    street: null,
    number: null,
    neighborhood: null,
    city: null,
    state: null,
    areaLabel: null,
  }
}
