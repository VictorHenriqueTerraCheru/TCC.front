import type { Schema } from '@/infrastructure/api'

export type EnderecoReverso = Schema<'ReverseResponse'>

export function enderecoIndisponivel(lat: number, lng: number): EnderecoReverso {
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
