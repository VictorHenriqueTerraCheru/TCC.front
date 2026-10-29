export interface Ponto {
  lat: number
  lng: number
}

export function pontoDaUrl(params: URLSearchParams): Ponto | null {
  const lat = params.get('lat')?.trim()
  const lng = params.get('lng')?.trim()
  if (!lat || !lng) return null
  const ponto = { lat: Number(lat), lng: Number(lng) }
  const valido =
    Number.isFinite(ponto.lat) &&
    Number.isFinite(ponto.lng) &&
    Math.abs(ponto.lat) <= 90 &&
    Math.abs(ponto.lng) <= 180
  return valido ? ponto : null
}
