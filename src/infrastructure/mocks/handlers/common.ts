import { HttpResponse } from 'msw'

interface Bounds {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

export function boundsFromUrl(url: URL): Bounds | null {
  const [minLat, minLng, maxLat, maxLng] = ['minLat', 'minLng', 'maxLat', 'maxLng'].map((name) =>
    Number(url.searchParams.get(name)),
  ) as [number, number, number, number]
  const valid =
    [minLat, maxLat].every((v) => v >= -90 && v <= 90) &&
    [minLng, maxLng].every((v) => v >= -180 && v <= 180) &&
    minLat < maxLat &&
    minLng < maxLng
  return valid ? { minLat, minLng, maxLat, maxLng } : null
}

export function inBounds(point: { lat: number; lng: number }, r: Bounds) {
  return (
    point.lat >= r.minLat && point.lat <= r.maxLat && point.lng >= r.minLng && point.lng <= r.maxLng
  )
}

export function list(url: URL, name: string): string[] {
  return (url.searchParams.get(name) ?? '').split(',').filter(Boolean)
}

export function ruleError(status: number, type: string, title: string) {
  return HttpResponse.json(
    { type, title, status },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

export function paginate<T>(list: T[], url: URL) {
  const page = Number(url.searchParams.get('page') ?? 1)
  const size = Number(url.searchParams.get('pageSize') ?? 20)
  return {
    items: list.slice((page - 1) * size, page * size),
    page,
    pageSize: size,
    total: list.length,
  }
}
