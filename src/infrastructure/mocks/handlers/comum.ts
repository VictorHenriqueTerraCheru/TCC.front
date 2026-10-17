import { HttpResponse } from 'msw'

interface Retangulo {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

/** Lê e valida o retângulo como a API (docs/API.md, GET /problemas). */
export function retanguloDaUrl(url: URL): Retangulo | null {
  const [minLat, minLng, maxLat, maxLng] = ['minLat', 'minLng', 'maxLat', 'maxLng'].map((nome) =>
    Number(url.searchParams.get(nome)),
  ) as [number, number, number, number]
  const valido =
    [minLat, maxLat].every((v) => v >= -90 && v <= 90) &&
    [minLng, maxLng].every((v) => v >= -180 && v <= 180) &&
    minLat < maxLat &&
    minLng < maxLng
  return valido ? { minLat, minLng, maxLat, maxLng } : null
}

export function noRetangulo(ponto: { lat: number; lng: number }, r: Retangulo) {
  return (
    ponto.lat >= r.minLat && ponto.lat <= r.maxLat && ponto.lng >= r.minLng && ponto.lng <= r.maxLng
  )
}

export function lista(url: URL, nome: string): string[] {
  return (url.searchParams.get(nome) ?? '').split(',').filter(Boolean)
}

/** ProblemDetails de regra de negócio (409/422/429), com o type estável de docs/API.md. */
export function erroDeRegra(status: number, type: string, title: string) {
  return HttpResponse.json(
    { type, title, status },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

/** Paginação da API: ?pagina&tamanho → { itens, pagina, tamanho, total }. */
export function paginar<T>(lista: T[], url: URL) {
  const pagina = Number(url.searchParams.get('pagina') ?? 1)
  const tamanho = Number(url.searchParams.get('tamanho') ?? 20)
  return {
    itens: lista.slice((pagina - 1) * tamanho, pagina * tamanho),
    pagina,
    tamanho,
    total: lista.length,
  }
}
