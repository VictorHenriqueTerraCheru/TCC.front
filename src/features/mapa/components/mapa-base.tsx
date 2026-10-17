import type { Map as MapaLeaflet } from 'leaflet'
import { useEffect, type ReactNode, type Ref } from 'react'
import { useMapEvents } from 'react-leaflet'

import { MapaOsm } from '@/common/components/mapa-osm'
import { useDebouncedCallback } from '@/common/hooks/use-debounced-callback'

import { retanguloDaApi, type Retangulo } from '../models/retangulo'

function OuvinteRetangulo({ aoMudar }: { aoMudar(retangulo: Retangulo | null): void }) {
  const avisar = useDebouncedCallback((mapa: MapaLeaflet) => {
    const limites = mapa.getBounds()
    aoMudar(
      retanguloDaApi({
        sul: limites.getSouth(),
        oeste: limites.getWest(),
        norte: limites.getNorth(),
        leste: limites.getEast(),
      }),
    )
  }, 400)

  const mapa = useMapEvents({ moveend: () => avisar(mapa) })
  // Primeiro retângulo: o mapa já nasce posicionado, sem moveend.
  useEffect(() => avisar(mapa), [mapa, avisar])
  return null
}

interface MapaBaseProps {
  centroInicial: [number, number]
  mostrarZoom: boolean
  aoMudarRetangulo(retangulo: Retangulo | null): void
  ref?: Ref<MapaLeaflet>
  children?: ReactNode
}

/** Mapa principal: tiles OSM + retângulo visível com debounce (regra 9). */
export function MapaBase({
  centroInicial,
  mostrarZoom,
  aoMudarRetangulo,
  ref,
  children,
}: MapaBaseProps) {
  return (
    <MapaOsm ref={ref} centro={centroInicial} mostrarZoom={mostrarZoom}>
      <OuvinteRetangulo aoMudar={aoMudarRetangulo} />
      {children}
    </MapaOsm>
  )
}
