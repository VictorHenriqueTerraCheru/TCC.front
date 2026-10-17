import type { MapRef } from '@vis.gl/react-maplibre'
import { useRef, type ReactNode, type Ref } from 'react'

import { MapaVetorial } from '@/common/components/mapa-vetorial'
import { useDebouncedCallback } from '@/common/hooks/use-debounced-callback'

import { retanguloDaApi, type Retangulo } from '../models/retangulo'

interface MapaBaseProps {
  centroInicial: [number, number]
  mostrarZoom: boolean
  aoMudarRetangulo(retangulo: Retangulo | null): void
  aoTocar?(ponto: { lat: number; lng: number }): void
  ref?: Ref<MapRef>
  children?: ReactNode
}

/** Mapa principal: estilo M2 + retângulo visível com debounce (regras 9 e 15). */
export function MapaBase({
  centroInicial,
  mostrarZoom,
  aoMudarRetangulo,
  aoTocar,
  ref,
  children,
}: MapaBaseProps) {
  const mapaRef = useRef<MapRef | null>(null)

  const avisar = useDebouncedCallback(() => {
    const limites = mapaRef.current?.getBounds()
    if (!limites) return
    aoMudarRetangulo(
      retanguloDaApi({
        sul: limites.getSouth(),
        oeste: limites.getWest(),
        norte: limites.getNorth(),
        leste: limites.getEast(),
      }),
    )
  }, 400)

  return (
    <MapaVetorial
      ref={(instancia) => {
        mapaRef.current = instancia
        if (typeof ref === 'function') ref(instancia)
        else if (ref) ref.current = instancia
      }}
      centro={centroInicial}
      mostrarZoom={mostrarZoom}
      // Primeiro retângulo: o mapa já nasce posicionado, sem moveend.
      aoCarregar={avisar}
      aoParar={avisar}
      aoTocar={aoTocar}
    >
      {children}
    </MapaVetorial>
  )
}
