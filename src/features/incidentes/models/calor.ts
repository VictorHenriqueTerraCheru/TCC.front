import type { FeatureCollection, Point } from 'geojson'
import type { ExpressionSpecification } from 'maplibre-gl'

import type { CelulaCalor } from './incidente'

/** Gradiente do calor (roxo → magenta → vermelho → amarelo) — também usado na legenda "Como ler o mapa". */
export const gradienteCalor: Record<number, string> = {
  0.2: '#5b2bff',
  0.45: '#c026d3',
  0.7: '#ff3b30',
  1: '#ffd60a',
}

// Ordena pelas paradas: em objetos, a chave inteira "1" vem antes de "0.2", "0.4"…
const paradas = Object.entries(gradienteCalor).sort(([a], [b]) => Number(a) - Number(b))

export const gradienteCalorCss = `linear-gradient(to right, ${paradas
  .map(([parada, cor]) => `${cor} ${Number(parada) * 100}%`)
  .join(', ')})`

/** heatmap-color do MapLibre: transparente sem densidade e as mesmas paradas da legenda. */
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

/**
 * Células da API como pontos GeoJSON com peso relativo à maior célula visível, com piso para
 * poucos relatos não saturarem.
 */
export function pesosCalor(celulas: CelulaCalor[]): FeatureCollection<Point, { peso: number }> {
  const maximo = Math.max(4, ...celulas.map((c) => c.quantidade))
  return {
    type: 'FeatureCollection',
    features: celulas.map((c) => ({
      type: 'Feature',
      properties: { peso: c.quantidade / maximo },
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
    })),
  }
}
