import type { Feature, LineString, Polygon } from 'geojson'

const EARTH_RADIUS_M = 6_371_000

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export interface Point {
  lat: number
  lng: number
}

export function circleGeoJson(center: Point, radiusMeters: number, passos = 64): Feature<Polygon> {
  const rad = (degrees: number) => (degrees * Math.PI) / 180
  const degrees = (radians: number) => (radians * 180) / Math.PI
  const angular = radiusMeters / EARTH_RADIUS_M
  const lat1 = rad(center.lat)
  const lng1 = rad(center.lng)
  const ring: [number, number][] = []
  for (let i = 0; i < passos; i++) {
    const heading = (2 * Math.PI * i) / passos
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(heading),
    )
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(heading) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
      )
    ring.push([degrees(lng2), degrees(lat2)])
  }
  ring.push(ring[0]!)
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }
}

export function lineGeoJson(a: Point, b: Point): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [a.lng, a.lat],
        [b.lng, b.lat],
      ],
    },
  }
}
