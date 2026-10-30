import { Layer, Source } from '@vis.gl/react-maplibre'
import { useMemo } from 'react'

import { heatmapGradientExpression, heatmapWeights } from '../models/heatmap'
import type { HeatmapCell } from '../models/incident'

const GRADIENT = heatmapGradientExpression()

export function HeatmapLayer({ cells }: { cells: HeatmapCell[] }) {
  const unwrapData = useMemo(() => heatmapWeights(cells), [cells])
  return (
    <Source id="calor" type="geojson" data={unwrapData}>
      <Layer
        id="calor"
        type="heatmap"
        paint={{
          'heatmap-weight': ['get', 'weight'],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 20, 13, 40, 16, 90],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 1, 14, 2.5],
          'heatmap-opacity': 0.75,
          'heatmap-color': GRADIENT,
        }}
      />
    </Source>
  )
}
