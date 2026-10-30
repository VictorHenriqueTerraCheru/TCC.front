import type { FeatureCollection, Point } from 'geojson'
import type { ExpressionSpecification } from 'maplibre-gl'

import type { HeatmapCell } from './incident'

export const heatmapGradient: Record<number, string> = {
  0.2: '#5b2bff',
  0.45: '#c026d3',
  0.7: '#ff3b30',
  1: '#ffd60a',
}

const stops = Object.entries(heatmapGradient).sort(([a], [b]) => Number(a) - Number(b))

export const heatmapGradientCss = `linear-gradient(to right, ${stops
  .map(([halted, color]) => `${color} ${Number(halted) * 100}%`)
  .join(', ')})`

export function heatmapGradientExpression(): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0,0,0,0)',
    ...stops.flatMap(([halted, color]) => [Number(halted), color]),
  ] as ExpressionSpecification
}

export function heatmapWeights(cells: HeatmapCell[]): FeatureCollection<Point, { weight: number }> {
  const maximum = Math.max(4, ...cells.map((c) => c.count))
  return {
    type: 'FeatureCollection',
    features: cells.map((c) => ({
      type: 'Feature',
      properties: { weight: c.count / maximum },
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
    })),
  }
}
