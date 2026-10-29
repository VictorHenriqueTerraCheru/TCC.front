import 'maplibre-gl/dist/maplibre-gl.css'

import {
  Map,
  NavigationControl,
  type MapRef,
  type StyleSpecification,
} from '@vis.gl/react-maplibre'
import type { ReactNode, Ref } from 'react'

import estiloClaro from '@/assets/mapa/estilo-claro.json'
import estiloEscuro from '@/assets/mapa/estilo-escuro.json'
import { useTema, type Tema } from '@/common/hooks/use-tema'
import { ZOOM_PADRAO } from '@/common/lib/mapa'

const ESTILOS: Record<Tema, StyleSpecification> = {
  claro: estiloClaro as StyleSpecification,
  escuro: estiloEscuro as StyleSpecification,
}

interface MapaVetorialProps {
  centro: [number, number]
  zoom?: number
  interativo?: boolean
  mostrarZoom?: boolean
  ref?: Ref<MapRef>
  aoMover?(): void
  aoParar?(): void
  aoTocar?(ponto: { lat: number; lng: number }): void
  aoCarregar?(): void
  className?: string
  children?: ReactNode
}

export function MapaVetorial({
  centro,
  zoom = ZOOM_PADRAO,
  interativo = true,
  mostrarZoom = false,
  ref,
  aoMover,
  aoParar,
  aoTocar,
  aoCarregar,
  className = 'size-full',
  children,
}: MapaVetorialProps) {
  const tema = useTema()
  return (
    <div className={className}>
      <Map
        ref={ref}
        initialViewState={{ latitude: centro[0], longitude: centro[1], zoom }}
        mapStyle={ESTILOS[tema]}
        minZoom={3}
        maxZoom={18}
        interactive={interativo}
        dragRotate={interativo}
        pitchWithRotate={interativo}
        attributionControl={{ compact: true }}
        style={{ width: '100%', height: '100%' }}
        onMove={aoMover && (() => aoMover())}
        onMoveEnd={aoParar && (() => aoParar())}
        onClick={aoTocar && ((e) => aoTocar({ lat: e.lngLat.lat, lng: e.lngLat.lng }))}
        onLoad={(e) => {
          if (window.innerWidth < 1024) {
            e.target
              .getContainer()
              .querySelector('.maplibregl-compact-show')
              ?.classList.remove('maplibregl-compact-show')
          }
          aoCarregar?.()
        }}
      >
        {mostrarZoom && <NavigationControl position="top-right" showCompass={false} />}
        {children}
      </Map>
    </div>
  )
}
