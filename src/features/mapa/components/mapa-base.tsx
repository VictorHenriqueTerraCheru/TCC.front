import type { MapRef } from '@vis.gl/react-maplibre'
import { useRef, type ReactNode, type Ref } from 'react'

import { VectorMap } from '@/common/components/mapa-vetorial'
import { useDebouncedCallback } from '@/common/hooks/use-debounced-callback'

import { apiBounds, type Bounds } from '../models/retangulo'

interface BaseMapProps {
  initialCenter: [number, number]
  showZoom: boolean
  onBoundsChange(bounds: Bounds | null): void
  onTap?(point: { lat: number; lng: number }): void
  ref?: Ref<MapRef>
  children?: ReactNode
}

export function BaseMap({
  initialCenter,
  showZoom,
  onBoundsChange,
  onTap,
  ref,
  children,
}: BaseMapProps) {
  const mapRef = useRef<MapRef | null>(null)

  const notify = useDebouncedCallback(() => {
    const bounds = mapRef.current?.getBounds()
    if (!bounds) return
    onBoundsChange(
      apiBounds({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      }),
    )
  }, 400)

  return (
    <VectorMap
      ref={(instance) => {
        mapRef.current = instance
        if (typeof ref === 'function') ref(instance)
        else if (ref) ref.current = instance
      }}
      center={initialCenter}
      showZoom={showZoom}
      onLoaded={notify}
      onStop={notify}
      onTap={onTap}
    >
      {children}
    </VectorMap>
  )
}
