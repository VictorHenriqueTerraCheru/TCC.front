import { pontoDaUrl } from './ponto'

const de = (busca: string) => pontoDaUrl(new URLSearchParams(busca))

test('lê lat e lng válidos', () => {
  expect(de('lat=-22.95&lng=-43.18')).toEqual({ lat: -22.95, lng: -43.18 })
})

test.each(['', 'lat=-22.95', 'lat=x&lng=-43', 'lat=&lng=-43', 'lat=91&lng=0', 'lat=0&lng=-181'])(
  'link inválido (%s) vira null',
  (busca) => {
    expect(de(busca)).toBeNull()
  },
)
