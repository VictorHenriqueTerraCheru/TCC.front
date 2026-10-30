import { readFile } from 'node:fs/promises'

import { adjustColor, applyRecipe, scaleWidth, LIGHT_RECIPE, M2_RECIPE } from './map-style.mjs'

test('adjustColor keeps the hue and applies lightness and saturation (capped at 100%)', () => {
  expect(adjustColor('hsl(40, 50%, 95%)', { scale: 1.1, saturation: 0.5 })).toBe(
    'hsla(40, 25%, 100%, 1)',
  )
  expect(adjustColor('hsl(210, 40%, 50%)', { scale: 0.66, saturation: 0.9 })).toBe(
    'hsla(210, 36%, 33%, 1)',
  )
  expect(adjustColor('#ffffff', { scale: 0.66, saturation: 0.9 })).toBe('hsla(0, 0%, 66%, 1)')
  expect(adjustColor('rgba(0,0,255,0.5)', { scale: 0.5, saturation: 1 })).toBe(
    'hsla(240, 100%, 25%, 0.5)',
  )
  expect(adjustColor('hsl(210,40,50)', { scale: 1, saturation: 1 })).toBe('hsla(210, 40%, 50%, 1)')
  expect(adjustColor('transparent', M2_RECIPE)).toBe('transparent')
})

test('scaleWidth scales numbers, stops, interpolate and step without touching the zooms', () => {
  expect(scaleWidth(2, 1.5)).toBe(3)
  expect(
    scaleWidth(
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
  expect(scaleWidth(['interpolate', ['exponential', 1.2], ['zoom'], 10, 1, 16, 4], 2)).toEqual([
    'interpolate',
    ['exponential', 1.2],
    ['zoom'],
    10,
    2,
    16,
    8,
  ])
  expect(scaleWidth(['step', ['zoom'], 1, 14, 3], 2)).toEqual(['step', ['zoom'], 2, 14, 6])
})

test('applyRecipe removes buildings and POIs, thickens roads and darkens colors, even inside expressions', () => {
  const style = {
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
  const r = applyRecipe(style)
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
  expect(style.layers).toHaveLength(4)
})

test('the light recipe softens the roads and makes the borders almost white, without touching the rest', () => {
  const style = {
    layers: [
      { id: 'road_trunk_primary', type: 'line', paint: { 'line-color': 'hsl(50, 100%, 80%)' } },
      {
        id: 'road_trunk_primary_casing',
        type: 'line',
        paint: { 'line-color': 'hsl(30, 80%, 70%)' },
      },
      { id: 'park', type: 'fill', paint: { 'fill-color': 'hsl(90, 40%, 85%)' } },
    ],
  }
  const [road, border, park] = applyRecipe(style, LIGHT_RECIPE).layers
  expect(road.paint['line-color']).toBe('hsla(50, 70%, 80%, 1)')
  expect(border.paint['line-color']).toBe('hsla(30, 12%, 77%, 1)')
  expect(park.paint['fill-color']).toBe('hsla(90, 40%, 85%, 1)')
})

test.each([
  ['src/assets/map/dark-style.json', 'urban-reports-dark'],
  ['src/assets/map/light-style.json', 'urban-reports-light'],
])('%s has no buildings nor colors outside the hsla pattern', async (file, name) => {
  const style = JSON.parse(await readFile(file, 'utf8'))
  expect(style.name).toBe(name)
  expect(style.layers.some((c) => /building|poi|housenumber|aeroway/.test(c.id))).toBe(false)
  const colors = JSON.stringify(style.layers.map((c) => c.paint ?? {})).match(
    /"(#[0-9a-f]{3,6}|rgba?\([^)]*\))"/gi,
  )
  expect(colors, 'run npm run gen:map-style').toBeNull()
})
