import 'leaflet/dist/leaflet.css'

import type { Map as MapaLeaflet, MapOptions } from 'leaflet'
import type { ReactNode, Ref } from 'react'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'

import { ZOOM_PADRAO } from '@/common/lib/mapa'

interface MapaOsmProps extends Omit<MapOptions, 'center' | 'zoom'> {
  centro: [number, number]
  zoom?: number
  mostrarZoom?: boolean
  ref?: Ref<MapaLeaflet>
  className?: string
  children?: ReactNode
}

/**
 * Mapa Leaflet com tiles do OpenStreetMap e atribuição visível. `centro` e `zoom` só valem na
 * criação (como no react-leaflet). Usado pelo mapa principal e pelo fluxo de registro.
 */
export function MapaOsm({
  centro,
  zoom = ZOOM_PADRAO,
  mostrarZoom = false,
  ref,
  className = 'size-full',
  children,
  ...opcoes
}: MapaOsmProps) {
  return (
    <MapContainer
      ref={ref}
      center={centro}
      zoom={zoom}
      minZoom={3}
      zoomControl={false}
      worldCopyJump
      className={className}
      {...opcoes}
    >
      <TileLayer
        className="mapa-tiles"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {mostrarZoom && <ZoomControl position="topright" />}
      {children}
    </MapContainer>
  )
}
