import { useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'

import { ResponsivePanel } from '@/common/components/responsive-panel'
import { IncidentArea } from '@/features/incidents'

import { useMapNavigation } from '../hooks/use-map-navigation'
import type { MapContext } from '../models/context'
import { pointFromUrl } from '../models/point'

export function IncidentAreaPage() {
  const [params] = useSearchParams()
  const { focus } = useOutletContext<MapContext>()
  const { close } = useMapNavigation()
  const point = pointFromUrl(params)
  const lat = point?.lat
  const lng = point?.lng

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) focus({ lat, lng })
  }, [lat, lng, focus])

  if (lat === undefined || lng === undefined) return null
  return (
    <ResponsivePanel title="Área de incidentes" onClose={close}>
      <IncidentArea lat={lat} lng={lng} />
    </ResponsivePanel>
  )
}
