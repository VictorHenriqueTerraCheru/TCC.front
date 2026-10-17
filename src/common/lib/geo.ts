import type { Feature, LineString, Polygon } from 'geojson'

const RAIO_TERRA_M = 6_371_000

/** Distância em metros entre dois pontos (haversine) — regra 3: calculada no front. */
export function distanciaMetros(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (graus: number) => (graus * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_TERRA_M * Math.asin(Math.sqrt(h))
}

export interface Ponto {
  lat: number
  lng: number
}

/**
 * Círculo de `raioMetros` como polígono GeoJSON ([lng, lat], anel fechado). O MapLibre não tem
 * círculo em metros: o raio da área de incidentes (400 m) e o do registro (150 m) viram polígono.
 */
export function circuloGeoJson(centro: Ponto, raioMetros: number, passos = 64): Feature<Polygon> {
  const rad = (graus: number) => (graus * Math.PI) / 180
  const graus = (radianos: number) => (radianos * 180) / Math.PI
  const angular = raioMetros / RAIO_TERRA_M
  const lat1 = rad(centro.lat)
  const lng1 = rad(centro.lng)
  const anel: [number, number][] = []
  for (let i = 0; i < passos; i++) {
    const rumo = (2 * Math.PI * i) / passos
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(rumo),
    )
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(rumo) * Math.sin(angular) * Math.cos(lat1),
        Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
      )
    anel.push([graus(lng2), graus(lat2)])
  }
  anel.push(anel[0]!)
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [anel] } }
}

/** Segmento entre dois pontos como LineString GeoJSON ([lng, lat]). */
export function linhaGeoJson(a: Ponto, b: Ponto): Feature<LineString> {
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
