import 'leaflet/dist/leaflet.css'

import type { Map as MapaLeaflet } from 'leaflet'
import { useEffect, type ReactNode, type Ref } from 'react'
import { MapContainer, TileLayer, useMapEvents, ZoomControl } from 'react-leaflet'

import { useDebouncedCallback } from '@/common/hooks/use-debounced-callback'

import { ZOOM_PADRAO } from '../models/mapa'
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

/** Mapa Leaflet com tiles do OpenStreetMap (atribuição visível) e o retângulo visível com debounce (regra 9). */
export function MapaBase({
  centroInicial,
  mostrarZoom,
  aoMudarRetangulo,
  ref,
  children,
}: MapaBaseProps) {
  return (
    <MapContainer
      ref={ref}
      center={centroInicial}
      zoom={ZOOM_PADRAO}
      minZoom={3}
      zoomControl={false}
      worldCopyJump
      className="size-full"
    >
      <TileLayer
        className="mapa-tiles"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {mostrarZoom && <ZoomControl position="topright" />}
      <OuvinteRetangulo aoMudar={aoMudarRetangulo} />
      {children}
    </MapContainer>
  )
}
