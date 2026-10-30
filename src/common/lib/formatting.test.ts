import { distanceText, relativeTime } from './formatting'

describe('formatting', () => {
  const now = new Date('2026-10-06T12:00:00Z')

  it.each([
    ['2026-10-06T11:59:40Z', 'now'],
    ['2026-10-06T11:20:00Z', 'há 40 min'],
    ['2026-10-06T07:00:00Z', 'há 5 h'],
    ['2026-10-04T07:52:00Z', 'há 2 dias'],
  ])('relativeTime(%s) = %s', (iso, expected) => {
    expect(relativeTime(iso, now)).toBe(expected)
  })

  it.each([
    [118, '120 m'],
    [4, '10 m'],
    [1234, '1,2 km'],
  ])('distanceText(%d) = %s', (meters, expected) => {
    expect(distanceText(meters)).toBe(expected)
  })
})
