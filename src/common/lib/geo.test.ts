import { distanciaMetros } from './distancia'

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
