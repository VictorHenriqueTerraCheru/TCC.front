import { circuloGeoJson, distanciaMetros, linhaGeoJson } from './geo'

describe('distanciaMetros', () => {
  it('é zero no mesmo ponto', () => {
    expect(distanciaMetros({ lat: -22.95, lng: -43.18 }, { lat: -22.95, lng: -43.18 })).toBe(0)
  })

  it('≈ 111 m por milésimo de grau de latitude', () => {
    const d = distanciaMetros({ lat: -22.951, lng: -43.18 }, { lat: -22.952, lng: -43.18 })
    expect(d).toBeGreaterThan(110)
    expect(d).toBeLessThan(112)
  })
})

describe('GeoJSON', () => {
  it('circuloGeoJson fecha o anel e tem o raio pedido', () => {
    const centro = { lat: -22.9519, lng: -43.1866 }
    const anel = circuloGeoJson(centro, 400, 32).geometry.coordinates[0]!
    expect(anel).toHaveLength(33)
    expect(anel[0]).toEqual(anel[32])
    for (const [lng, lat] of anel)
      expect(distanciaMetros(centro, { lat: lat!, lng: lng! })).toBeCloseTo(400, -1)
  })

  it('linhaGeoJson usa [lng, lat]', () => {
    expect(linhaGeoJson({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }).geometry.coordinates).toEqual([
      [2, 1],
      [4, 3],
    ])
  })
})
