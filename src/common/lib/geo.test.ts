import { circleGeoJson, distanceMeters, lineGeoJson } from './geo'

describe('distanceMeters', () => {
  it('is zero at the same point', () => {
    expect(distanceMeters({ lat: -22.95, lng: -43.18 }, { lat: -22.95, lng: -43.18 })).toBe(0)
  })

  it('≈ 111 m per thousandth of a degree of latitude', () => {
    const d = distanceMeters({ lat: -22.951, lng: -43.18 }, { lat: -22.952, lng: -43.18 })
    expect(d).toBeGreaterThan(110)
    expect(d).toBeLessThan(112)
  })
})

describe('GeoJSON', () => {
  it('circleGeoJson closes the ring and has the requested radius', () => {
    const center = { lat: -22.9519, lng: -43.1866 }
    const ring = circleGeoJson(center, 400, 32).geometry.coordinates[0]!
    expect(ring).toHaveLength(33)
    expect(ring[0]).toEqual(ring[32])
    for (const [lng, lat] of ring)
      expect(distanceMeters(center, { lat: lat!, lng: lng! })).toBeCloseTo(400, -1)
  })

  it('lineGeoJson uses [lng, lat]', () => {
    expect(lineGeoJson({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }).geometry.coordinates).toEqual([
      [2, 1],
      [4, 3],
    ])
  })
})
