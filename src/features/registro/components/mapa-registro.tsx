import { Layer, Marker, Source, useMap } from '@vis.gl/react-maplibre'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CompassButton } from '@/common/components/botao-bussola'
import { Icon } from '@/common/components/icone'
import { VectorMap } from '@/common/components/mapa-vetorial'
import { useTheme } from '@/common/hooks/use-tema'
import { distanceText } from '@/common/lib/formatacao'
import { circleGeoJson, lineGeoJson } from '@/common/lib/geo'
import { DEFAULT_CENTER, DASH_COLOR } from '@/common/lib/mapa'
import { iconOf, useAppearance, type CategorySummary } from '@/features/categorias'
import { useEnableLocation, useGeolocation } from '@/features/localizacao'
import { IssueMarker } from '@/features/problemas'

import { useDraftStore, type Point } from '../stores/rascunho-store'

const INCIDENT_AREA_RADIUS_M = 150

type ReportMapProps =
  | { mode: 'pin'; category: CategorySummary | null }
  | { mode: 'area' }
  | {
      mode: 'duplicateCheck'
      newPoint: Point
      existing: Point & { category: CategorySummary; distanceMeters: number }
    }
  | { mode: 'static' }

function CenterListener({ onMove }: { onMove?(center: Point): void }) {
  const setLocation = useDraftStore((s) => s.setLocation)
  const { current: map } = useMap()
  useEffect(() => {
    if (!map) return
    const center = () => {
      const { lat, lng } = map.getCenter()
      return { lat, lng }
    }
    const move = () => onMove?.(center())
    const stop = () => setLocation(center())
    stop()
    map.on('move', move)
    map.on('moveend', stop)
    return () => {
      map.off('move', move)
      map.off('moveend', stop)
    }
  }, [map, onMove, setLocation])
  return null
}

function GpsButton() {
  const { current: map } = useMap()
  const { position } = useGeolocation()
  const { activate, dialog } = useEnableLocation()

  async function recenter() {
    const destination = position ?? (await activate())
    if (destination && map) {
      map.flyTo({ center: [destination.lng, destination.lat], zoom: Math.max(map.getZoom(), 16) })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void recenter()}
        aria-label="Usar minha localização"
        className="absolute right-3 bottom-10 z-[1000] flex size-11 pressionavel items-center justify-center rounded-xl bg-superficie-2 shadow-2 focus-visible:outline-2"
      >
        <Icon name="my_location" />
      </button>
      {dialog}
    </>
  )
}

function DragHint({ text }: { text: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 top-3 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-lg bg-background/95 px-3 py-1.5 text-sm shadow-2">
      <Icon name="pan_tool" className="text-[18px]" />
      {text}
    </p>
  )
}

function AreaAtCenter({ initial }: { initial: Point }) {
  const [center, setCenter] = useState(initial)
  const theme = useTheme()
  const area = useMemo(() => circleGeoJson(center, INCIDENT_AREA_RADIUS_M), [center])
  return (
    <>
      <CenterListener onMove={setCenter} />
      <Source id="report-area" type="geojson" data={area}>
        <Layer
          id="report-area"
          type="fill"
          paint={{ 'fill-color': '#e4844c', 'fill-opacity': 0.28 }}
        />
        <Layer
          id="report-area-border"
          type="line"
          paint={{
            'line-color': DASH_COLOR[theme],
            'line-width': 1.5,
            'line-dasharray': [2, 2.5],
          }}
        />
      </Source>
      <Marker latitude={center.lat} longitude={center.lng} anchor="center">
        <CenterPoint color="var(--background)" pageSize={10} />
      </Marker>
    </>
  )
}

function CenterPoint({ color, pageSize: size }: { color: string; pageSize: number }) {
  return (
    <span
      aria-hidden="true"
      className="block rounded-full border-2 border-white shadow"
      style={{ width: size, height: size, background: color }}
    />
  )
}

function FitDuplicateCheck({ newPoint, existing }: { newPoint: Point; existing: Point }) {
  const { current: map } = useMap()
  useEffect(() => {
    map?.fitBounds(
      [
        [Math.min(newPoint.lng, existing.lng), Math.min(newPoint.lat, existing.lat)],
        [Math.max(newPoint.lng, existing.lng), Math.max(newPoint.lat, existing.lat)],
      ],
      { padding: 90, maxZoom: 18, duration: 0 },
    )
  }, [map, newPoint, existing])
  return null
}

interface InitialCenter {
  center: [number, number]
  provisional: boolean
}

function useInitialCenter(): InitialCenter {
  const location = useDraftStore((s) => s.location)
  const { position } = useGeolocation()
  const [initial] = useState<InitialCenter>(() => {
    const point = location ?? position
    return point
      ? { center: [point.lat, point.lng], provisional: false }
      : { center: DEFAULT_CENTER, provisional: true }
  })
  return initial
}

function CenterOnFirstPosition() {
  const { position } = useGeolocation()
  const resolvedRef = useRef(false)
  const { current: map } = useMap()
  useEffect(() => {
    if (!map) return
    const dragged = () => {
      resolvedRef.current = true
    }
    map.on('dragstart', dragged)
    return () => {
      map.off('dragstart', dragged)
    }
  }, [map])
  useEffect(() => {
    if (resolvedRef.current || !position || !map) return
    resolvedRef.current = true
    map.jumpTo({ center: [position.lng, position.lat] })
  }, [map, position])
  return null
}

export function ReportMap(props: ReportMapProps) {
  const { center, provisional } = useInitialCenter()
  const location = useDraftStore((s) => s.location)
  const theme = useTheme()
  const { appearanceOf } = useAppearance()

  if (props.mode === 'duplicateCheck') {
    const { newPoint, existing } = props
    const color = appearanceOf(existing.category).strongColor
    const icon = iconOf(existing.category)
    const middle = {
      lat: (newPoint.lat + existing.lat) / 2,
      lng: (newPoint.lng + existing.lng) / 2,
    }
    return (
      <VectorMap center={[newPoint.lat, newPoint.lng]} zoom={17} interactive={false}>
        <FitDuplicateCheck newPoint={newPoint} existing={existing} />
        <Source id="report-line" type="geojson" data={lineGeoJson(newPoint, existing)}>
          <Layer
            id="report-line"
            type="line"
            paint={{ 'line-color': DASH_COLOR[theme], 'line-width': 2, 'line-dasharray': [2, 2] }}
          />
        </Source>
        <Marker latitude={existing.lat} longitude={existing.lng} anchor="bottom">
          <IssueMarker color={color} icon={icon} status="active" band="high" />
        </Marker>
        <Marker latitude={newPoint.lat} longitude={newPoint.lng} anchor="bottom">
          <IssueMarker color={color} icon={icon} status="active" band="high" selected />
        </Marker>
        <Marker latitude={middle.lat} longitude={middle.lng} anchor="center">
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background">
            {distanceText(existing.distanceMeters)}
          </span>
        </Marker>
      </VectorMap>
    )
  }

  if (props.mode === 'static') {
    const point = location ?? { lat: center[0], lng: center[1] }
    return (
      <VectorMap center={[point.lat, point.lng]} interactive={false}>
        {location && (
          <Marker latitude={location.lat} longitude={location.lng} anchor="center">
            <CenterPoint color="var(--primario)" pageSize={14} />
          </Marker>
        )}
      </VectorMap>
    )
  }

  if (props.mode === 'area') {
    return (
      <>
        <VectorMap center={center} zoom={15}>
          <AreaAtCenter initial={{ lat: center[0], lng: center[1] }} />
          {provisional && <CenterOnFirstPosition />}
          <GpsButton />
          <CompassButton className="right-3 bottom-[92px]" />
        </VectorMap>
        <DragHint text="Arraste o mapa para ajustar a área" />
      </>
    )
  }

  const category = props.category
  return (
    <>
      <VectorMap center={center} zoom={16}>
        <CenterListener />
        {provisional && <CenterOnFirstPosition />}
        <GpsButton />
        <CompassButton className="right-3 bottom-[92px]" />
      </VectorMap>
      <DragHint text="Arraste o mapa para ajustar" />

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-full">
        {category && (
          <IssueMarker
            color={appearanceOf(category).strongColor}
            icon={iconOf(category)}
            status="active"
            band="high"
            selected
          />
        )}
      </div>
    </>
  )
}
