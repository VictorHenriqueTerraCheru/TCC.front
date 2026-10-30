import { heatmapGradientExpression, heatmapGradientCss, heatmapWeights } from './heatmap'
import type { HeatmapCell } from './incident'

test('the heatmap legend goes from purple (less) to yellow (more)', () => {
  expect(heatmapGradientCss).toBe(
    'linear-gradient(to right, #5b2bff 20%, #c026d3 45%, #ff3b30 70%, #ffd60a 100%)',
  )
})

test('heatmapWeights normalizes by the largest cell with a floor of 4', () => {
  const cell = (amount: number) => ({ lat: 0, lng: 0, count: amount }) as HeatmapCell
  expect(
    heatmapWeights([cell(2), cell(8)]).features.map(
      (f: { properties: { weight: number } }) => f.properties.weight,
    ),
  ).toEqual([0.25, 1])
  expect(heatmapWeights([cell(1)]).features[0]!.properties.weight).toBe(0.25)
  expect(
    heatmapWeights([{ lat: -22.9, lng: -43.1, count: 4 } as HeatmapCell]).features[0]!.geometry
      .coordinates,
  ).toEqual([-43.1, -22.9])
})

test('heatmapGradientExpression starts transparent and follows the stops in order', () => {
  const e = heatmapGradientExpression()
  expect(e.slice(0, 5)).toEqual([
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0,0,0,0)',
  ])
  expect(e[5]).toBe(0.2)
  expect(e.at(-2)).toBe(1)
})
