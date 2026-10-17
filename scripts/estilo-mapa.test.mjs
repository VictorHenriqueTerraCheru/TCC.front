import { readFile } from 'node:fs/promises'

import { aplicarReceita, escalarLargura, escurecerCor, RECEITA_M2 } from './estilo-mapa.mjs'

test('escurecerCor mantém o matiz e aplica luminosidade e saturação', () => {
  expect(escurecerCor('hsl(210, 40%, 50%)', { escala: 0.66, saturacao: 0.9 })).toBe(
    'hsla(210, 36%, 33%, 1)',
  )
  expect(escurecerCor('#ffffff', { escala: 0.66, saturacao: 0.9 })).toBe('hsla(0, 0%, 66%, 1)')
  expect(escurecerCor('rgba(0,0,255,0.5)', { escala: 0.5, saturacao: 1 })).toBe(
    'hsla(240, 100%, 25%, 0.5)',
  )
  expect(escurecerCor('hsl(210,40,50)', { escala: 1, saturacao: 1 })).toBe('hsla(210, 40%, 50%, 1)')
  expect(escurecerCor('transparent', RECEITA_M2)).toBe('transparent')
})

test('escalarLargura escala números, stops, interpolate e step sem mexer nos zooms', () => {
  expect(escalarLargura(2, 1.5)).toBe(3)
  expect(
    escalarLargura(
      {
        stops: [
          [10, 1],
          [16, 4],
        ],
      },
      2,
    ),
  ).toEqual({
    stops: [
      [10, 2],
      [16, 8],
    ],
  })
  expect(escalarLargura(['interpolate', ['exponential', 1.2], ['zoom'], 10, 1, 16, 4], 2)).toEqual([
    'interpolate',
    ['exponential', 1.2],
    ['zoom'],
    10,
    2,
    16,
    8,
  ])
  expect(escalarLargura(['step', ['zoom'], 1, 14, 3], 2)).toEqual(['step', ['zoom'], 2, 14, 6])
})

test('aplicarReceita remove prédios e POIs, engrossa vias e escurece cores, inclusive dentro de expressões', () => {
  const estilo = {
    layers: [
      { id: 'building', type: 'fill', paint: { 'fill-color': '#888888' } },
      { id: 'poi_label', type: 'symbol' },
      {
        id: 'highway_minor',
        type: 'line',
        paint: {
          'line-width': 2,
          'line-color': ['match', ['get', 'x'], 'a', '#ffffff', '#000000'],
        },
      },
      { id: 'water', type: 'fill', paint: { 'fill-color': 'hsl(210, 40%, 50%)' } },
    ],
  }
  const r = aplicarReceita(estilo)
  expect(r.layers.map((c) => c.id)).toEqual(['highway_minor', 'water'])
  expect(r.layers[0].paint['line-width']).toBeCloseTo(3.4)
  expect(r.layers[0].paint['line-color']).toEqual([
    'match',
    ['get', 'x'],
    'a',
    'hsla(0, 0%, 66%, 1)',
    'hsla(0, 0%, 0%, 1)',
  ])
  expect(r.layers[1].paint['fill-color']).toBe('hsla(210, 36%, 33%, 1)')
  expect(estilo.layers).toHaveLength(4) // não muta a entrada
})

test('o estilo versionado não tem prédios nem cores fora do padrão hsla', async () => {
  const estilo = JSON.parse(await readFile('src/assets/mapa/estilo.json', 'utf8'))
  expect(estilo.layers.some((c) => /building|poi|housenumber|aeroway/.test(c.id))).toBe(false)
  const cores = JSON.stringify(estilo.layers.map((c) => c.paint ?? {})).match(
    /"(#[0-9a-f]{3,6}|rgba?\([^)]*\))"/gi,
  )
  expect(cores, 'rode npm run gen:estilo-mapa').toBeNull()
})
