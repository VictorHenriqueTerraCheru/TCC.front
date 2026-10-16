import type { Schema } from '@/infrastructure/api'

export type EnderecoReverso = Schema<'ReversaResponse'>

/** Mesmo fallback que a API usa quando o Nominatim falha (docs/API.md). */
export function enderecoIndisponivel(lat: number, lng: number): EnderecoReverso {
  return {
    disponivel: false,
    endereco: `Próximo a ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    logradouro: null,
    numero: null,
    bairro: null,
    cidade: null,
    uf: null,
    rotuloArea: null,
  }
}
