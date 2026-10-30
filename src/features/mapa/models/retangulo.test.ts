import { apiBounds } from './retangulo'

describe('apiBounds', () => {
  it('rounds outward to 3 decimals', () => {
    expect(
      apiBounds({ south: -22.95871, west: -43.19102, north: -22.94512, east: -43.18044 }),
    ).toEqual({ minLat: -22.959, minLng: -43.192, maxLat: -22.945, maxLng: -43.18 })
  })

  it('clamps longitude and latitude when zooming out beyond the world (rule 15)', () => {
    expect(apiBounds({ south: -95, west: -400.5, north: 91, east: 250 })).toEqual({
      minLat: -90,
      minLng: -180,
      maxLat: 90,
      maxLng: 180,
    })
  })

  it('returns null when no valid bounds remain', () => {
    expect(apiBounds({ south: 10, west: 190, north: 20, east: 200 })).toBeNull()
  })
})
