export interface Bounds {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

interface MapEdges {
  south: number
  west: number
  north: number
  east: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function apiBounds({ south, west, north, east }: MapEdges, decimals = 3): Bounds | null {
  const factor = 10 ** decimals
  const roundDown = (v: number) => Math.floor(v * factor) / factor
  const roundUp = (v: number) => Math.ceil(v * factor) / factor

  const bounds = {
    minLat: clamp(roundDown(south), -90, 90),
    minLng: clamp(roundDown(west), -180, 180),
    maxLat: clamp(roundUp(north), -90, 90),
    maxLng: clamp(roundUp(east), -180, 180),
  }
  const valid = bounds.minLat < bounds.maxLat && bounds.minLng < bounds.maxLng
  return valid ? bounds : null
}
