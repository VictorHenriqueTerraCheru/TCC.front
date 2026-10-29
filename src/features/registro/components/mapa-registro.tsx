import { Layer, Marker, Source, useMap } from '@vis.gl/react-maplibre'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BotaoBussola } from '@/common/components/botao-bussola'
import { Icone } from '@/common/components/icone'
import { MapaVetorial } from '@/common/components/mapa-vetorial'
import { useTema } from '@/common/hooks/use-tema'
import { distanciaTexto } from '@/common/lib/formatacao'
import { circuloGeoJson, linhaGeoJson } from '@/common/lib/geo'
import { CENTRO_PADRAO, COR_TRACEJADO } from '@/common/lib/mapa'
import { iconeDe, useAparencia, type CategoriaResumo } from '@/features/categorias'
import { useAtivarLocalizacao, useLocalizacao } from '@/features/localizacao'
import { MarcadorProblema } from '@/features/problemas'

import { useRascunhoStore, type Ponto } from '../stores/rascunho-store'

const RAIO_AREA_INCIDENTE_M = 150

type MapaRegistroProps =
  | { modo: 'pino'; category: CategoriaResumo | null }
  | { modo: 'area' }
  | {
      modo: 'conferencia'
      novo: Ponto
      existente: Ponto & { category: CategoriaResumo; distanceMeters: number }
    }
  | { modo: 'estatico' }

function OuvinteCentro({ aoMover }: { aoMover?(centro: Ponto): void }) {
  const definirLocal = useRascunhoStore((s) => s.definirLocal)
  const { current: mapa } = useMap()
  useEffect(() => {
    if (!mapa) return
    const centro = () => {
      const { lat, lng } = mapa.getCenter()
      return { lat, lng }
    }
    const mover = () => aoMover?.(centro())
    const parar = () => definirLocal(centro())
    parar()
    mapa.on('move', mover)
    mapa.on('moveend', parar)
    return () => {
      mapa.off('move', mover)
      mapa.off('moveend', parar)
    }
  }, [mapa, aoMover, definirLocal])
  return null
}

function BotaoGps() {
  const { current: mapa } = useMap()
  const { posicao } = useLocalizacao()
  const { ativar, dialogo } = useAtivarLocalizacao()

  async function centralizar() {
    const destino = posicao ?? (await ativar())
    if (destino && mapa) {
      mapa.flyTo({ center: [destino.lng, destino.lat], zoom: Math.max(mapa.getZoom(), 16) })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void centralizar()}
        aria-label="Usar minha localização"
        className="absolute right-3 bottom-10 z-[1000] flex size-11 pressionavel items-center justify-center rounded-xl bg-superficie-2 shadow-2 focus-visible:outline-2"
      >
        <Icone name="my_location" />
      </button>
      {dialogo}
    </>
  )
}

function DicaArrastar({ texto }: { texto: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-lg bg-background/95 px-3 py-1.5 text-sm shadow-2">
      <Icone name="pan_tool" className="text-[18px]" />
      {texto}
    </p>
  )
}

function AreaNoCentro({ inicial }: { inicial: Ponto }) {
  const [centro, setCentro] = useState(inicial)
  const tema = useTema()
  const area = useMemo(() => circuloGeoJson(centro, RAIO_AREA_INCIDENTE_M), [centro])
  return (
    <>
      <OuvinteCentro aoMover={setCentro} />
      <Source id="registro-area" type="geojson" data={area}>
        <Layer
          id="registro-area"
          type="fill"
          paint={{ 'fill-color': '#e4844c', 'fill-opacity': 0.28 }}
        />
        <Layer
          id="registro-area-borda"
          type="line"
          paint={{
            'line-color': COR_TRACEJADO[tema],
            'line-width': 1.5,
            'line-dasharray': [2, 2.5],
          }}
        />
      </Source>
      <Marker latitude={centro.lat} longitude={centro.lng} anchor="center">
        <PontoCentral color="var(--background)" pageSize={10} />
      </Marker>
    </>
  )
}

function PontoCentral({ color: cor, pageSize: tamanho }: { color: string; pageSize: number }) {
  return (
    <span
      aria-hidden="true"
      className="block rounded-full border-2 border-white shadow"
      style={{ width: tamanho, height: tamanho, background: cor }}
    />
  )
}

function EnquadrarConferencia({ novo, existente }: { novo: Ponto; existente: Ponto }) {
  const { current: mapa } = useMap()
  useEffect(() => {
    mapa?.fitBounds(
      [
        [Math.min(novo.lng, existente.lng), Math.min(novo.lat, existente.lat)],
        [Math.max(novo.lng, existente.lng), Math.max(novo.lat, existente.lat)],
      ],
      { padding: 90, maxZoom: 18, duration: 0 },
    )
  }, [mapa, novo, existente])
  return null
}

interface CentroInicial {
  centro: [number, number]
  provisorio: boolean
}

function useCentroInicial(): CentroInicial {
  const local = useRascunhoStore((s) => s.local)
  const { posicao } = useLocalizacao()
  const [inicial] = useState<CentroInicial>(() => {
    const ponto = local ?? posicao
    return ponto
      ? { centro: [ponto.lat, ponto.lng], provisorio: false }
      : { centro: CENTRO_PADRAO, provisorio: true }
  })
  return inicial
}

function CentrarNaPrimeiraPosicao() {
  const { posicao } = useLocalizacao()
  const resolvidoRef = useRef(false)
  const { current: mapa } = useMap()
  useEffect(() => {
    if (!mapa) return
    const arrastou = () => {
      resolvidoRef.current = true
    }
    mapa.on('dragstart', arrastou)
    return () => {
      mapa.off('dragstart', arrastou)
    }
  }, [mapa])
  useEffect(() => {
    if (resolvidoRef.current || !posicao || !mapa) return
    resolvidoRef.current = true
    mapa.jumpTo({ center: [posicao.lng, posicao.lat] })
  }, [mapa, posicao])
  return null
}

export function MapaRegistro(props: MapaRegistroProps) {
  const { centro, provisorio } = useCentroInicial()
  const local = useRascunhoStore((s) => s.local)
  const tema = useTema()
  const { aparenciaDe } = useAparencia()

  if (props.modo === 'conferencia') {
    const { novo, existente } = props
    const cor = aparenciaDe(existente.category).corForte
    const icone = iconeDe(existente.category)
    const meio = { lat: (novo.lat + existente.lat) / 2, lng: (novo.lng + existente.lng) / 2 }
    return (
      <MapaVetorial centro={[novo.lat, novo.lng]} zoom={17} interativo={false}>
        <EnquadrarConferencia novo={novo} existente={existente} />
        <Source id="registro-linha" type="geojson" data={linhaGeoJson(novo, existente)}>
          <Layer
            id="registro-linha"
            type="line"
            paint={{ 'line-color': COR_TRACEJADO[tema], 'line-width': 2, 'line-dasharray': [2, 2] }}
          />
        </Source>
        <Marker latitude={existente.lat} longitude={existente.lng} anchor="bottom">
          <MarcadorProblema color={cor} icon={icone} status="active" band="high" />
        </Marker>
        <Marker latitude={novo.lat} longitude={novo.lng} anchor="bottom">
          <MarcadorProblema color={cor} icon={icone} status="active" band="high" selecionado />
        </Marker>
        <Marker latitude={meio.lat} longitude={meio.lng} anchor="center">
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background">
            {distanciaTexto(existente.distanceMeters)}
          </span>
        </Marker>
      </MapaVetorial>
    )
  }

  if (props.modo === 'estatico') {
    const ponto = local ?? { lat: centro[0], lng: centro[1] }
    return (
      <MapaVetorial centro={[ponto.lat, ponto.lng]} interativo={false}>
        {local && (
          <Marker latitude={local.lat} longitude={local.lng} anchor="center">
            <PontoCentral color="var(--primario)" pageSize={14} />
          </Marker>
        )}
      </MapaVetorial>
    )
  }

  if (props.modo === 'area') {
    return (
      <>
        <MapaVetorial centro={centro} zoom={15}>
          <AreaNoCentro inicial={{ lat: centro[0], lng: centro[1] }} />
          {provisorio && <CentrarNaPrimeiraPosicao />}
          <BotaoGps />
          <BotaoBussola className="right-3 bottom-[92px]" />
        </MapaVetorial>
        <DicaArrastar texto="Arraste o mapa para ajustar a área" />
      </>
    )
  }

  const categoria = props.category
  return (
    <>
      <MapaVetorial centro={centro} zoom={16}>
        <OuvinteCentro />
        {provisorio && <CentrarNaPrimeiraPosicao />}
        <BotaoGps />
        <BotaoBussola className="right-3 bottom-[92px]" />
      </MapaVetorial>
      <DicaArrastar texto="Arraste o mapa para ajustar" />

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-full">
        {categoria && (
          <MarcadorProblema
            color={aparenciaDe(categoria).corForte}
            icon={iconeDe(categoria)}
            status="active"
            band="high"
            selecionado
          />
        )}
      </div>
    </>
  )
}
