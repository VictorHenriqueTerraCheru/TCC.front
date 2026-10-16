import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

import { L } from '../lib/leaflet-heat'
import { gradienteCalor } from '../models/calor'
import type { CelulaCalor } from '../models/incidente'

// O leaflet.heat agenda o redesenho num requestAnimationFrame e não cancela ao sair do mapa:
// se a camada é removida antes (desmontagem, StrictMode), o quadro roda com _map nulo.
function protegerRedesenho(camada: L.HeatLayer) {
  const comRedesenho = camada as L.HeatLayer & { _redraw(): void; _map: L.Map | null }
  const redesenhar = comRedesenho._redraw.bind(comRedesenho)
  comRedesenho._redraw = () => {
    if (comRedesenho._map) redesenhar()
  }
}

interface CamadaCalorProps {
  celulas: CelulaCalor[]
}

/** Mapa de calor dos incidentes (leaflet.heat). Incidentes não têm marcador (regra 7). */
export function CamadaCalor({ celulas }: CamadaCalorProps) {
  const mapa = useMap()
  const camadaRef = useRef<L.HeatLayer | null>(null)

  useEffect(() => {
    const camada = L.heatLayer([], {
      radius: 40,
      blur: 32,
      // O plugin divide a intensidade por 2 a cada nível abaixo de maxZoom; 12 = cheia nos bairros.
      maxZoom: 12,
      minOpacity: 0.3,
      gradient: gradienteCalor,
    })
    protegerRedesenho(camada)
    camada.addTo(mapa)
    camadaRef.current = camada
    return () => {
      camada.remove()
      camadaRef.current = null
    }
  }, [mapa])

  useEffect(() => {
    // Intensidade relativa à maior célula visível, com piso para poucos relatos não saturarem.
    const maximo = Math.max(4, ...celulas.map((c) => c.quantidade))
    camadaRef.current?.setLatLngs(celulas.map((c) => [c.lat, c.lng, c.quantidade / maximo]))
  }, [celulas])

  return null
}
