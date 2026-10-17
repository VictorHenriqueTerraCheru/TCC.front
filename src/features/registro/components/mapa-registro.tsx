import { latLngBounds } from 'leaflet'
import { useEffect, useState } from 'react'
import {
  Circle,
  CircleMarker,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import { Icone } from '@/common/components/icone'
import { MapaOsm } from '@/common/components/mapa-osm'
import { CENTRO_PADRAO } from '@/common/lib/mapa'
import { distanciaTexto } from '@/common/lib/formatacao'
import { aparenciaDoGrupo, grupoDe, iconeDe, type CategoriaResumo } from '@/features/categorias'
import { useAtivarLocalizacao, useLocalizacao } from '@/features/localizacao'
import { iconeMarcadorProblema, MarcadorProblema } from '@/features/problemas'

import { useRascunhoStore, type Ponto } from '../stores/rascunho-store'

/** Raio desenhado no passo do incidente (tela 21a). A API arredonda o ponto para ~110 m. */
const RAIO_AREA_INCIDENTE_M = 150

type MapaRegistroProps =
  | { modo: 'pino'; categoria: CategoriaResumo | null }
  | { modo: 'area' }
  | {
      modo: 'conferencia'
      novo: Ponto
      existente: Ponto & { categoria: CategoriaResumo; distanciaMetros: number }
    }
  | { modo: 'estatico' }

/** O centro do mapa é o local do rascunho: grava ao parar de mover (e ao abrir). */
function OuvinteCentro({ aoMover }: { aoMover?(centro: Ponto): void }) {
  const definirLocal = useRascunhoStore((s) => s.definirLocal)
  const mapa = useMapEvents({
    move: () => aoMover?.(mapa.getCenter()),
    moveend: () => {
      const { lat, lng } = mapa.getCenter()
      definirLocal({ lat, lng })
    },
  })
  useEffect(() => {
    const { lat, lng } = mapa.getCenter()
    definirLocal({ lat, lng })
  }, [mapa, definirLocal])
  return null
}

function BotaoGps() {
  const mapa = useMap()
  const { posicao } = useLocalizacao()
  const { ativar, dialogo } = useAtivarLocalizacao()

  async function centralizar() {
    const destino = posicao ?? (await ativar())
    if (destino) mapa.flyTo([destino.lat, destino.lng], Math.max(mapa.getZoom(), 17))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void centralizar()}
        aria-label="Usar minha localização"
        className="absolute right-3 bottom-10 z-[1000] flex size-11 items-center justify-center rounded-xl bg-surface-container-high shadow-md focus-visible:outline-2"
      >
        <Icone nome="my_location" />
      </button>
      {dialogo}
    </>
  )
}

function DicaArrastar({ texto }: { texto: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-lg bg-background/95 px-3 py-1.5 text-sm shadow-md">
      <Icone nome="pan_tool" className="text-[18px]" />
      {texto}
    </p>
  )
}

function AreaNoCentro({ inicial }: { inicial: Ponto }) {
  const [centro, setCentro] = useState(inicial)
  return (
    <>
      <OuvinteCentro aoMover={setCentro} />
      <Circle
        center={centro}
        radius={RAIO_AREA_INCIDENTE_M}
        interactive={false}
        pathOptions={{
          color: '#171d1a',
          weight: 1.5,
          dashArray: '4 5',
          fillColor: '#e4844c',
          fillOpacity: 0.28,
        }}
      />
      <CircleMarker
        center={centro}
        radius={5}
        interactive={false}
        pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#171d1a', fillOpacity: 1 }}
      />
    </>
  )
}

function EnquadrarConferencia({ novo, existente }: { novo: Ponto; existente: Ponto }) {
  const mapa = useMap()
  useEffect(() => {
    // Vizinhos a poucos metros: zoom alto para os dois pinos não se sobreporem.
    mapa.fitBounds(latLngBounds([novo, existente]), { padding: [90, 90], maxZoom: 19 })
  }, [mapa, novo, existente])
  return null
}

/** Ponto inicial: o já escolhido, senão a posição atual, senão Botafogo. */
function useCentroInicial(): [number, number] {
  const local = useRascunhoStore((s) => s.local)
  const { posicao } = useLocalizacao()
  const [centro] = useState<[number, number]>(() => {
    const ponto = local ?? posicao
    return ponto ? [ponto.lat, ponto.lng] : CENTRO_PADRAO
  })
  return centro
}

export function MapaRegistro(props: MapaRegistroProps) {
  const centro = useCentroInicial()
  const local = useRascunhoStore((s) => s.local)

  if (props.modo === 'conferencia') {
    const { novo, existente } = props
    return (
      <MapaOsm
        centro={[novo.lat, novo.lng]}
        zoom={18}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <EnquadrarConferencia novo={novo} existente={existente} />
        <Polyline
          positions={[novo, existente]}
          interactive={false}
          pathOptions={{ color: '#171d1a', weight: 2, dashArray: '4 4' }}
        >
          <Tooltip permanent direction="center" className="tooltip-distancia">
            {distanciaTexto(existente.distanciaMetros)}
          </Tooltip>
        </Polyline>
        <Marker
          position={existente}
          icon={iconeMarcadorProblema(existente.categoria, 'ativa', 'alta')}
          interactive={false}
        />
        <Marker
          position={novo}
          icon={iconeMarcadorProblema(existente.categoria, 'ativa', 'alta', true)}
          interactive={false}
        />
      </MapaOsm>
    )
  }

  if (props.modo === 'estatico') {
    return (
      <MapaOsm centro={local ? [local.lat, local.lng] : centro}>
        {local && (
          <CircleMarker
            center={local}
            radius={7}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#046d4e', fillOpacity: 1 }}
          />
        )}
      </MapaOsm>
    )
  }

  if (props.modo === 'area') {
    return (
      <>
        <MapaOsm centro={centro} zoom={16}>
          <AreaNoCentro inicial={{ lat: centro[0], lng: centro[1] }} />
          <BotaoGps />
        </MapaOsm>
        <DicaArrastar texto="Arraste o mapa para ajustar a área" />
      </>
    )
  }

  const categoria = props.categoria
  return (
    <>
      <MapaOsm centro={centro} zoom={17}>
        <OuvinteCentro />
        <BotaoGps />
      </MapaOsm>
      <DicaArrastar texto="Arraste o mapa para ajustar" />
      {/* Pino fixo no centro: quem se move é o mapa. A ponta do pino marca o ponto. */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-full">
        {categoria && (
          <MarcadorProblema
            cor={aparenciaDoGrupo[grupoDe(categoria)].corForte}
            icone={iconeDe(categoria)}
            status="ativa"
            faixa="alta"
            selecionado
          />
        )}
      </div>
    </>
  )
}
