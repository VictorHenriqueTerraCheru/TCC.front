import type { FeatureCollection, Point } from 'geojson'
import type { ExpressionSpecification } from 'maplibre-gl'

import type { CelulaCalor } from './incidente'

export const gradienteCalor: Record<number, string> = {
  0.2: '#5b2bff',
  0.45: '#c026d3',
  0.7: '#ff3b30',
  1: '#ffd60a',
}

const paradas = Object.entries(gradienteCalor).sort(([a], [b]) => Number(a) - Number(b))

export const gradienteCalorCss = `linear-gradient(to right, ${paradas
  .map(([parada, cor]) => `${cor} ${Number(parada) * 100}%`)
  .join(', ')})`

export function expressaoGradienteCalor(): ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0,0,0,0)',
    ...paradas.flatMap(([parada, cor]) => [Number(parada), cor]),
  ] as ExpressionSpecification
}

export function pesosCalor(celulas: CelulaCalor[]): FeatureCollection<Point, { peso: number }> {
  const maximo = Math.max(4, ...celulas.map((c) => c.count))
  return {
    type: 'FeatureCollection',
    features: celulas.map((c) => ({
      type: 'Feature',
      properties: { peso: c.count / maximo },
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
    })),
  }
}
