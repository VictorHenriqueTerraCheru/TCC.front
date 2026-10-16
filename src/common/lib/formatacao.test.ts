import { distanciaTexto, tempoRelativo } from './formatacao'

describe('formatacao', () => {
  const agora = new Date('2026-10-06T12:00:00Z')

  it.each([
    ['2026-10-06T11:59:40Z', 'agora'],
    ['2026-10-06T11:20:00Z', 'há 40 min'],
    ['2026-10-06T07:00:00Z', 'há 5 h'],
    ['2026-10-04T07:52:00Z', 'há 2 dias'],
  ])('tempoRelativo(%s) = %s', (iso, esperado) => {
    expect(tempoRelativo(iso, agora)).toBe(esperado)
  })

  it.each([
    [118, '120 m'],
    [4, '10 m'],
    [1234, '1,2 km'],
  ])('distanciaTexto(%d) = %s', (metros, esperado) => {
    expect(distanciaTexto(metros)).toBe(esperado)
  })
})
