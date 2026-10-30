import 'maplibre-gl/dist/maplibre-gl.css'

import {
  Map,
  NavigationControl,
  type MapRef,
  type StyleSpecification,
} from '@vis.gl/react-maplibre'
import type { ReactNode, Ref } from 'react'

import lightStyle from '@/assets/mapa/estilo-claro.json'
import darkStyle from '@/assets/mapa/estilo-escuro.json'
import { useTheme, type Theme } from '@/common/hooks/use-tema'
import { DEFAULT_ZOOM } from '@/common/lib/mapa'

const STYLES: Record<Theme, StyleSpecification> = {
  light: lightStyle as StyleSpecification,
  dark: darkStyle as StyleSpecification,
}

interface VectorMapProps {
  center: [number, number]
  zoom?: number
  interactive?: boolean
  showZoom?: boolean
  ref?: Ref<MapRef>
  onMove?(): void
  onStop?(): void
  onTap?(point: { lat: number; lng: number }): void
  onLoaded?(): void
  className?: string
  children?: ReactNode
}

export function VectorMap({
  center,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  showZoom = false,
  ref,
  onMove,
  onStop,
  onTap,
  onLoaded,
  className = 'size-full',
  children,
}: VectorMapProps) {
  const theme = useTheme()
  return (
    <div className={className}>
      <Map
        ref={ref}
        initialViewState={{ latitude: center[0], longitude: center[1], zoom }}
        mapStyle={STYLES[theme]}
        minZoom={3}
        maxZoom={18}
        interactive={interactive}
        dragRotate={interactive}
        pitchWithRotate={interactive}
        attributionControl={{ compact: true }}
        style={{ width: '100%', height: '100%' }}
        onMove={onMove && (() => onMove())}
        onMoveEnd={onStop && (() => onStop())}
        onClick={onTap && ((e) => onTap({ lat: e.lngLat.lat, lng: e.lngLat.lng }))}
        onLoad={(e) => {
          if (window.innerWidth < 1024) {
            e.target
              .getContainer()
              .querySelector('.maplibregl-compact-show')
              ?.classList.remove('maplibregl-compact-show')
          }
          onLoaded?.()
        }}
      >
        {showZoom && <NavigationControl position="top-right" showCompass={false} />}
        {children}
      </Map>
    </div>
  )
}
