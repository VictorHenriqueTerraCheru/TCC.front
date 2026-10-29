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

interface Limites {
  sul: number
  oeste: number
  norte: number
  leste: number
}
type Ouvinte = (evento: Record<string, unknown>) => void
type CentroAlvo = [number, number] | { lng: number; lat: number }
interface Destino {
  center?: CentroAlvo
  zoom?: number
  bearing?: number
  pitch?: number
}

export class InstanciaFalsa {
  centro = { lat: 0, lng: 0 }
  zoom = 16
  bearing = 0
  pitch = 0
  limites: Limites | null = null
  elemento: HTMLDivElement | null = null
  private ouvintes = new globalThis.Map<string, Set<Ouvinte>>()

  getMap() {
    return this
  }
  getCenter() {
    return { ...this.centro }
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
    const l = this.limites ?? {
      sul: this.centro.lat - 0.01,
      oeste: this.centro.lng - 0.01,
      norte: this.centro.lat + 0.01,
      leste: this.centro.lng + 0.01,
    }
    return {
      getSouth: () => l.sul,
      getWest: () => l.oeste,
      getNorth: () => l.norte,
      getEast: () => l.leste,
    }
  }
  getContainer() {
    return this.elemento!
  }
  getCanvas() {
    return this.elemento!
  }
  isStyleLoaded() {
    return true
  }
  resize() {}
  project() {
    return { x: 0, y: 0 }
  }
  unproject() {
    return { lng: this.centro.lng, lat: this.centro.lat }
  }
  on(tipo: string, ouvinte: Ouvinte) {
    if (!this.ouvintes.has(tipo)) this.ouvintes.set(tipo, new Set())
    this.ouvintes.get(tipo)!.add(ouvinte)
    return this
  }
  off(tipo: string, ouvinte: Ouvinte) {
    this.ouvintes.get(tipo)?.delete(ouvinte)
    return this
  }
  once(tipo: string, ouvinte: Ouvinte) {
    const uma: Ouvinte = (e) => {
      this.off(tipo, uma)
      ouvinte(e)
    }
    return this.on(tipo, uma)
  }
  emitir(tipo: string, evento: Record<string, unknown> = {}) {
    for (const ouvinte of [...(this.ouvintes.get(tipo) ?? [])]) ouvinte({ type: tipo, ...evento })
  }
  private irPara({ center, zoom, bearing, pitch }: Destino) {
    if (center) {
      this.centro = Array.isArray(center)
        ? { lng: center[0], lat: center[1] }
        : { lng: center.lng, lat: center.lat }
    }
    if (zoom !== undefined) this.zoom = zoom
    this.emitir('movestart')
    if (bearing !== undefined) {
      this.bearing = bearing
      this.emitir('rotate')
    }
    if (pitch !== undefined) {
      this.pitch = pitch
      this.emitir('pitch')
    }
    this.emitir('move')
    this.emitir('moveend')
  }
  jumpTo(opcoes: Destino) {
    this.irPara(opcoes)
  }
  easeTo(opcoes: Destino) {
    this.irPara(opcoes)
  }
  flyTo(opcoes: Destino) {
    this.irPara(opcoes)
  }
  resetNorthPitch() {
    this.irPara({ bearing: 0, pitch: 0 })
  }
  setCenter(center: CentroAlvo) {
    this.irPara({ center })
  }
  fitBounds() {
    this.irPara({})
  }
  zoomOut() {
    this.irPara({ zoom: this.zoom - 1 })
  }
}

let atual: InstanciaFalsa | null = null

export const mapaFalso = {
  atual: () => atual,
  tocar(lat: number, lng: number) {
    atual?.emitir('click', { lngLat: { lat, lng } })
  },
  mover(centro: { lat: number; lng: number }, limites?: Limites) {
    if (!atual) return
    atual.limites = limites ?? null
    atual.jumpTo({ center: centro })
  },
  girar(bearing: number, pitch = 0) {
    atual?.jumpTo({ bearing, pitch })
  },
}

const ContextoMapa = createContext<InstanciaFalsa | null>(null)

export function useMap() {
  const instancia = useContext(ContextoMapa)
  return { current: instancia ?? undefined }
}

interface MapProps {
  ref?: Ref<InstanciaFalsa>
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
  const [instancia] = useState(() => {
    const nova = new InstanciaFalsa()
    nova.centro = { lat: initialViewState?.latitude ?? 0, lng: initialViewState?.longitude ?? 0 }
    nova.zoom = initialViewState?.zoom ?? 16
    return nova
  })
  const divRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => instancia, [instancia])

  const callbacks = useRef({ onMove, onMoveEnd, onClick, onLoad })
  useEffect(() => {
    callbacks.current = { onMove, onMoveEnd, onClick, onLoad }
  })

  useEffect(() => {
    instancia.elemento = divRef.current
    atual = instancia
    const mover: Ouvinte = (e) => callbacks.current.onMove?.(e)
    const parar: Ouvinte = (e) => callbacks.current.onMoveEnd?.(e)
    const tocar: Ouvinte = (e) =>
      callbacks.current.onClick?.(e as { lngLat: { lat: number; lng: number } })
    instancia.on('move', mover).on('moveend', parar).on('click', tocar)
    callbacks.current.onLoad?.({ target: instancia })
    return () => {
      instancia.off('move', mover).off('moveend', parar).off('click', tocar)
      if (atual === instancia) atual = null
    }
  }, [instancia])

  return (
    <ContextoMapa.Provider value={instancia}>
      <div
        ref={divRef}
        data-testid="mapa"
        data-estilo={(mapStyle as { name?: string } | undefined)?.name}
        className="maplibregl-map"
        onClick={() => instancia.emitir('click', { lngLat: instancia.getCenter() })}
      >
        {children}
      </div>
    </ContextoMapa.Provider>
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
      data-testid="marcador"
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
  const dados = data as { features?: unknown[]; type?: string } | undefined
  const pontos = dados?.features?.length ?? (dados?.type === 'Feature' ? 1 : 0)
  return (
    <div data-testid={`fonte-${id ?? 'sem-id'}`} data-pontos={pontos}>
      {children}
    </div>
  )
}

export function Layer({ id, type }: { id?: string; type?: string; [prop: string]: unknown }) {
  return <div data-testid={`camada-${id ?? 'sem-id'}`} data-tipo={type} />
}

export function NavigationControl() {
  return null
}

export type MapRef = InstanciaFalsa
export type StyleSpecification = Record<string, unknown>
