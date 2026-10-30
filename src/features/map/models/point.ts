export interface Point {
  lat: number
  lng: number
}

export function pointFromUrl(params: URLSearchParams): Point | null {
  const lat = params.get('lat')?.trim()
  const lng = params.get('lng')?.trim()
  if (!lat || !lng) return null
  const point = { lat: Number(lat), lng: Number(lng) }
  const valid =
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  return valid ? point : null
}
