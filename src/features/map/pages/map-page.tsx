import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useMatch, useNavigate, useSearchParams } from 'react-router'
import { Layer, Source, type MapRef } from '@vis.gl/react-maplibre'

import { CompassButton } from '@/common/components/compass-button'
import { Icon } from '@/common/components/icon'
import { useDesktop } from '@/common/hooks/use-media-query'
import { useTheme } from '@/common/hooks/use-theme'
import { circleGeoJson } from '@/common/lib/geo'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { useRequireAccount } from '@/features/auth'
import { useAppearance, useCategories, useGroups } from '@/features/categories'
import {
  incidentAreaQuery,
  HeatmapLayer,
  sevenDayTotal,
  useIncidentHeatmap,
} from '@/features/incidents'
import { useEnableLocation, useGeolocation } from '@/features/location'
import { IssueLayer, useIssuesInArea } from '@/features/issues'

import { LocationBanner } from '../components/location-banner'
import { MapButton } from '../components/map-button'
import { FilterChips } from '../components/filter-chips'
import { EmptyState } from '../components/empty-state'
import { MapLegend } from '../components/map-legend'
import { BaseMap } from '../components/base-map'
import { UserMarker } from '../components/user-marker'
import { ModePicker } from '../components/mode-picker'
import { useMapFilters } from '../hooks/use-map-filters'
import { useMapNavigation } from '../hooks/use-map-navigation'
import type { MapContext } from '../models/context'
import { layerFilters, showsHeatmap } from '../models/filters'
import { pointFromUrl } from '../models/point'
import { DEFAULT_CENTER, DASH_COLOR, DEFAULT_ZOOM } from '@/common/lib/map'
import type { Bounds } from '../models/bounds'

const LEGEND_SEEN_KEY = 'urbanReports.legendSeen'
const EMPTY_NOTICE_DISMISSED_KEY = 'urbanReports.emptyNoticeDismissed'
const PANEL_WIDTH = 420

function checked(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return true
  }
}

function mark(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    void 0
  }
}

export function MapPage() {
  const desktop = useDesktop()
  const theme = useTheme()
  const filters = useMapFilters()
  const { groups: allGroups } = useAppearance()
  const layers = layerFilters(filters, allGroups)
  const geolocation = useGeolocation()
  const enableLocation = useEnableLocation()
  const navigation = useMapNavigation()
  const requireAccount = useRequireAccount()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const issueRoute = useMatch('/map/issue/:id')
  const areaRoute = useMatch('/map/area')
  const [params] = useSearchParams()
  const panelOpen = issueRoute !== null || areaRoute !== null

  const [map, setMap] = useState<MapRef | null>(null)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [legendOpen, setLegendOpen] = useState(() => !checked(LEGEND_SEEN_KEY))
  const [aviso, setAviso] = useState<string | null>(null)
  const [emptyDismissed, setEmptyDismissed] = useState(false)
  const [emptyClosed, setEmptyClosed] = useState(() => checked(EMPTY_NOTICE_DISMISSED_KEY))

  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data
  const groupsQuery = useGroups()
  const categoriesById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
  )

  const issues = useIssuesInArea(bounds && layers.issues ? { ...bounds, ...layers.issues } : null)
  const heatmap = useIncidentHeatmap(
    bounds && layers.heatmap ? { ...bounds, ...layers.heatmap, days: 7 } : null,
  )

  const [initialCenter] = useState<[number, number]>(() =>
    geolocation.position ? [geolocation.position.lat, geolocation.position.lng] : DEFAULT_CENTER,
  )
  const centeredRef = useRef(geolocation.position !== null)
  useEffect(() => {
    if (!map || !geolocation.position || centeredRef.current || panelOpen) return
    centeredRef.current = true
    map.jumpTo({ center: [geolocation.position.lng, geolocation.position.lat], zoom: DEFAULT_ZOOM })
  }, [map, geolocation.position, panelOpen])

  useEffect(() => {
    if (!map) return
    const container = map.getContainer()
    const dismiss = () => setEmptyDismissed(true)
    container.addEventListener('pointerdown', dismiss)
    container.addEventListener('wheel', dismiss, { passive: true })
    return () => {
      container.removeEventListener('pointerdown', dismiss)
      container.removeEventListener('wheel', dismiss)
    }
  }, [map])

  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(timer)
  }, [aviso])

  const focus = useCallback<MapContext['focus']>(
    ({ lat, lng }) => {
      if (!map) return
      centeredRef.current = true
      const offset: [number, number] = desktop
        ? [PANEL_WIDTH / 2, 0]
        : [0, -map.getContainer().clientHeight * 0.05]
      map.easeTo({ center: [lng, lat], offset })
    },
    [map, desktop],
  )
  const context = useMemo<MapContext>(() => ({ focus }), [focus])

  async function onMapTap(lat: number, lng: number) {
    try {
      const area = await queryClient.fetchQuery(incidentAreaQuery(lat, lng))
      if (sevenDayTotal(area) > 0) navigation.openArea(lat, lng)
      else setAviso('Sem incidentes por aqui nos últimos 7 dias')
    } catch {
      setAviso('Não foi possível consultar os incidentes desta área')
    }
  }

  async function onGpsClick() {
    const position = geolocation.position ?? (await enableLocation.activate())
    centeredRef.current = true
    if (position) {
      map?.flyTo({
        center: [position.lng, position.lat],
        zoom: Math.max(map.getZoom(), DEFAULT_ZOOM),
      })
    }
  }

  function toggleLegend() {
    mark(LEGEND_SEEN_KEY)
    setLegendOpen((open) => !open)
  }

  const queries = [layers.issues && issues, layers.heatmap && heatmap].filter((query) => !!query)
  const categoriesFailed = layers.issues !== null && categoriesQuery.isError
  const groupsFailed = groupsQuery.isError
  const didLoad = queries.length > 0 && queries.every((c) => c.isSuccess && !c.isPlaceholderData)
  const empty = didLoad && queries.every((c) => c.data?.length === 0)
  if (emptyDismissed && didLoad && !empty) setEmptyDismissed(false)
  const failed = categoriesFailed || groupsFailed || queries.some((c) => c.isError)
  const noLocation = geolocation.state === 'prompt' || geolocation.state === 'denied'
  const areaPoint = areaRoute ? pointFromUrl(params) : null
  const areaLat = areaPoint?.lat
  const areaLng = areaPoint?.lng
  const areaCircle = useMemo(
    () =>
      areaLat !== undefined && areaLng !== undefined
        ? circleGeoJson({ lat: areaLat, lng: areaLng }, 400)
        : null,
    [areaLat, areaLng],
  )

  return (
    <div className="main-map relative isolate size-full">
      <h1 className="sr-only">Mapa de ocorrências</h1>
      <BaseMap
        ref={setMap}
        initialCenter={initialCenter}
        showZoom={desktop}
        onBoundsChange={setBounds}
        onTap={showsHeatmap(filters.mode) ? ({ lat, lng }) => void onMapTap(lat, lng) : undefined}
      >
        {layers.heatmap && heatmap.data && <HeatmapLayer cells={heatmap.data} />}
        {layers.issues && issues.data && (
          <IssueLayer
            issues={issues.data}
            categories={categoriesById}
            selectedId={issueRoute?.params.id}
            onSelect={navigation.openIssue}
          />
        )}
        {areaCircle && (
          <Source id="area-incidentes" type="geojson" data={areaCircle}>
            <Layer
              id="area-incidentes"
              type="line"
              paint={{
                'line-color': DASH_COLOR[theme],
                'line-width': 1.5,
                'line-dasharray': [2, 2.5],
              }}
            />
          </Source>
        )}
        {geolocation.position && <UserMarker position={geolocation.position} />}

        <CompassButton className="right-3 bottom-[267px] lg:right-4 lg:bottom-[155px]" />
      </BaseMap>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-[1000] space-y-2 p-3 lg:right-auto lg:w-[620px] lg:p-4',
          panelOpen && 'lg:left-[420px]',
        )}
      >
        <ModePicker mode={filters.mode} onChange={filters.setMode} />
        <FilterChips
          {...filters}
          onToggleGroup={filters.toggleGroup}
          onToggleNew={filters.toggleNew}
        />
        {noLocation && <LocationBanner onActivate={() => void enableLocation.activate()} />}
        {failed && (
          <div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-destructive/15 py-2 pr-2 pl-4 text-[13px] text-destructive shadow-2"
          >
            <span className="flex-1">Não foi possível carregar o mapa.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (categoriesFailed) void categoriesQuery.refetch()
                if (groupsFailed) void groupsQuery.refetch()
                queries.forEach((c) => void c.refetch())
              }}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      {empty && !emptyClosed && !emptyDismissed && !failed && !panelOpen && (
        <div className="pointer-events-none absolute inset-x-6 top-1/2 z-[1000] -translate-y-1/2">
          <EmptyState
            onViewLargerArea={() => map?.zoomTo(map.getZoom() - 2)}
            onClose={() => {
              mark(EMPTY_NOTICE_DISMISSED_KEY)
              setEmptyClosed(true)
            }}
          />
        </div>
      )}

      {legendOpen && (
        <div
          className={cn(
            'pointer-events-none absolute bottom-[152px] left-3 z-[1000] lg:bottom-6 lg:left-4',
            panelOpen && 'lg:left-[436px]',
          )}
        >
          <MapLegend mode={filters.mode} onClose={toggleLegend} />
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-[168px] z-[1000] mx-auto w-fit max-w-[90%] rounded-2xl px-4 py-2.5 text-sm shadow-3 glass lg:bottom-8"
        >
          {aviso}
        </div>
      )}

      <div className="pointer-events-auto absolute right-3 bottom-[168px] z-[1000] flex flex-col divide-y divide-glass-border overflow-hidden rounded-[14px] shadow-2 glass lg:right-4 lg:bottom-14">
        <MapButton
          aria-label={legendOpen ? 'Fechar legenda' : 'Abrir legenda'}
          aria-pressed={legendOpen}
          onClick={toggleLegend}
        >
          <Icon name="info" />
        </MapButton>
        <MapButton
          aria-label={
            geolocation.state === 'granted'
              ? 'Centralizar na minha localização'
              : 'Ativar localização'
          }
          onClick={() => void onGpsClick()}
        >
          <Icon
            name={
              geolocation.state === 'denied' || geolocation.state === 'unavailable'
                ? 'location_disabled'
                : 'near_me'
            }
            filled
          />
        </MapButton>
      </div>

      {!desktop && (
        <Link
          to="/report"
          onClick={(event) => {
            event.preventDefault()
            requireAccount('report', () => navigate('/report'), { returnTo: '/report' })
          }}
          className="absolute bottom-[92px] left-1/2 z-[1000] flex h-12 -translate-x-1/2 pressable items-center gap-2 rounded-full bg-primary bg-linear-to-b from-black/0 to-black/12 px-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_8px_22px_color-mix(in_srgb,var(--primary)_45%,transparent)] hover:brightness-110 focus-visible:outline-2"
        >
          <Icon name="add_location_alt" />
          Registrar
        </Link>
      )}

      {enableLocation.dialog}
      <Outlet context={context} />
    </div>
  )
}
