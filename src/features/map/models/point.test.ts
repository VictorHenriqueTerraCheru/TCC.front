import { pointFromUrl } from './point'

const de = (search: string) => pointFromUrl(new URLSearchParams(search))

test('reads valid lat and lng', () => {
  expect(de('lat=-22.95&lng=-43.18')).toEqual({ lat: -22.95, lng: -43.18 })
})

test.each(['', 'lat=-22.95', 'lat=x&lng=-43', 'lat=&lng=-43', 'lat=91&lng=0', 'lat=0&lng=-181'])(
  'invalid link (%s) becomes null',
  (search) => {
    expect(de(search)).toBeNull()
  },
)
