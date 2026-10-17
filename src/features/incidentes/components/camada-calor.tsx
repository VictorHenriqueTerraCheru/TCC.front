import { Layer, Source } from '@vis.gl/react-maplibre'
import { useMemo } from 'react'

import { expressaoGradienteCalor, pesosCalor } from '../models/calor'
import type { CelulaCalor } from '../models/incidente'

const GRADIENTE = expressaoGradienteCalor()

/** Mapa de calor dos incidentes (heatmap nativo do MapLibre). Incidentes não têm marcador (regra 7). */
export function CamadaCalor({ celulas }: { celulas: CelulaCalor[] }) {
  const dados = useMemo(() => pesosCalor(celulas), [celulas])
  return (
    <Source id="calor" type="geojson" data={dados}>
      <Layer
        id="calor"
        type="heatmap"
        paint={{
          'heatmap-weight': ['get', 'peso'],
          // Cada célula da API agrega ~110 m: raio e intensidade altos para virar mancha contínua.
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 20, 13, 40, 16, 90],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 1, 14, 2.5],
          'heatmap-opacity': 0.75,
          'heatmap-color': GRADIENTE,
        }}
      />
    </Source>
  )
}
