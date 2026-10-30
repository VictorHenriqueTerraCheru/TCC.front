/* eslint-disable react-refresh/only-export-components, react-hooks/immutability -- falso de teste: imita o pacote e a instância mutável do MapLibre */
import {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react'

interface MapEdges {
  south: number
  west: number
  north: number
  east: number
}
type Listener = (event: Record<string, unknown>) => void
type TargetCenter = [number, number] | { lng: number; lat: number }
interface Destination {
  center?: TargetCenter
  zoom?: number
  bearing?: number
  pitch?: number
}

export class FakeInstance {
  center = { lat: 0, lng: 0 }
  zoom = 16
  bearing = 0
  pitch = 0
  bounds: MapEdges | null = null
  element: HTMLDivElement | null = null
  private listeners = new globalThis.Map<string, Set<Listener>>()

  getMap() {
    return this
  }
  getCenter() {
    return { ...this.center }
  }
  getZoom() {
    return this.zoom
  }
  getBearing() {
    return this.bearing
  }
  getPitch() {
    return this.pitch
  }
  getBounds() {
    const l = this.bounds ?? {
      south: this.center.lat - 0.01,
      west: this.center.lng - 0.01,
      north: this.center.lat + 0.01,
      east: this.center.lng + 0.01,
    }
    return {
      getSouth: () => l.south,
      getWest: () => l.west,
      getNorth: () => l.north,
      getEast: () => l.east,
    }
  }
  getContainer() {
    return this.element!
  }
  getCanvas() {
    return this.element!
  }
  isStyleLoaded() {
    return true
  }
  resize() {}
  project() {
    return { x: 0, y: 0 }
  }
  unproject() {
    return { lng: this.center.lng, lat: this.center.lat }
  }
  on(type: string, listener: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(listener)
    return this
  }
  off(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener)
    return this
  }
  once(type: string, listener: Listener) {
    const one: Listener = (e) => {
      this.off(type, one)
      listener(e)
    }
    return this.on(type, one)
  }
  emit(type: string, event: Record<string, unknown> = {}) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener({ type, ...event })
  }
  private goTo({ center, zoom, bearing, pitch }: Destination) {
    if (center) {
      this.center = Array.isArray(center)
        ? { lng: center[0], lat: center[1] }
        : { lng: center.lng, lat: center.lat }
    }
    if (zoom !== undefined) this.zoom = zoom
    this.emit('movestart')
    if (bearing !== undefined) {
      this.bearing = bearing
      this.emit('rotate')
    }
    if (pitch !== undefined) {
      this.pitch = pitch
      this.emit('pitch')
    }
    this.emit('move')
    this.emit('moveend')
  }
  jumpTo(options: Destination) {
    this.goTo(options)
  }
  easeTo(options: Destination) {
    this.goTo(options)
  }
  flyTo(options: Destination) {
    this.goTo(options)
  }
  resetNorthPitch() {
    this.goTo({ bearing: 0, pitch: 0 })
  }
  setCenter(center: TargetCenter) {
    this.goTo({ center })
  }
  fitBounds() {
    this.goTo({})
  }
  zoomOut() {
    this.goTo({ zoom: this.zoom - 1 })
  }
}

let current: FakeInstance | null = null

export const fakeMap = {
  current: () => current,
  tap(lat: number, lng: number) {
    current?.emit('click', { lngLat: { lat, lng } })
  },
  move(center: { lat: number; lng: number }, bounds?: MapEdges) {
    if (!current) return
    current.bounds = bounds ?? null
    current.jumpTo({ center })
  },
  rotate(bearing: number, pitch = 0) {
    current?.jumpTo({ bearing, pitch })
  },
}

const MapContext = createContext<FakeInstance | null>(null)

export function useMap() {
  const instance = useContext(MapContext)
  return { current: instance ?? undefined }
}

interface MapProps {
  ref?: Ref<FakeInstance>
  initialViewState?: { latitude?: number; longitude?: number; zoom?: number }
  style?: React.CSSProperties
  children?: ReactNode
  onMove?(e: unknown): void
  onMoveEnd?(e: unknown): void
  onClick?(e: { lngLat: { lat: number; lng: number } }): void
  onLoad?(e: unknown): void
  [prop: string]: unknown
}

export function Map({
  ref,
  initialViewState,
  children,
  onMove,
  onMoveEnd,
  onClick,
  onLoad,
  mapStyle,
}: MapProps) {
  const [instance] = useState(() => {
    const fresh = new FakeInstance()
    fresh.center = { lat: initialViewState?.latitude ?? 0, lng: initialViewState?.longitude ?? 0 }
    fresh.zoom = initialViewState?.zoom ?? 16
    return fresh
  })
  const divRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => instance, [instance])

  const callbacks = useRef({ onMove, onMoveEnd, onClick, onLoad })
  useEffect(() => {
    callbacks.current = { onMove, onMoveEnd, onClick, onLoad }
  })

  useEffect(() => {
    instance.element = divRef.current
    current = instance
    const move: Listener = (e) => callbacks.current.onMove?.(e)
    const stop: Listener = (e) => callbacks.current.onMoveEnd?.(e)
    const tap: Listener = (e) =>
      callbacks.current.onClick?.(e as { lngLat: { lat: number; lng: number } })
    instance.on('move', move).on('moveend', stop).on('click', tap)
    callbacks.current.onLoad?.({ target: instance })
    return () => {
      instance.off('move', move).off('moveend', stop).off('click', tap)
      if (current === instance) current = null
    }
  }, [instance])

  return (
    <MapContext.Provider value={instance}>
      <div
        ref={divRef}
        data-testid="map"
        data-style={(mapStyle as { name?: string } | undefined)?.name}
        className="maplibregl-map"
        onClick={() => instance.emit('click', { lngLat: instance.getCenter() })}
      >
        {children}
      </div>
    </MapContext.Provider>
  )
}

interface MarkerProps {
  latitude: number
  longitude: number
  style?: React.CSSProperties
  onClick?(e: { originalEvent: { stopPropagation(): void } }): void
  children?: ReactNode
  [prop: string]: unknown
}

export function Marker({ latitude, longitude, style, onClick, children }: MarkerProps) {
  return (
    <div
      data-testid="marker"
      data-lat={latitude}
      data-lng={longitude}
      style={style}
      onClick={(e: MouseEvent) =>
        onClick?.({ originalEvent: { stopPropagation: () => e.stopPropagation() } })
      }
    >
      {children}
    </div>
  )
}

interface SourceProps {
  id?: string
  data?: unknown
  children?: ReactNode
  [prop: string]: unknown
}

export function Source({ id, data, children }: SourceProps) {
  const sourceData = data as { features?: unknown[]; type?: string } | undefined
  const points = sourceData?.features?.length ?? (sourceData?.type === 'Feature' ? 1 : 0)
  return (
    <div data-testid={`source-${id ?? 'no-id'}`} data-points={points}>
      {children}
    </div>
  )
}

export function Layer({ id, type }: { id?: string; type?: string; [prop: string]: unknown }) {
  return <div data-testid={`layer-${id ?? 'no-id'}`} data-type={type} />
}

export function NavigationControl() {
  return null
}

export type MapRef = FakeInstance
export type StyleSpecification = Record<string, unknown>
