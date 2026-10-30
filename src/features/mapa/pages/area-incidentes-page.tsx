import { useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'

import { ResponsivePanel } from '@/common/components/painel-responsivo'
import { IncidentArea } from '@/features/incidentes'

import { useMapNavigation } from '../hooks/use-navegacao-mapa'
import type { MapContext } from '../models/contexto'
import { pointFromUrl } from '../models/ponto'

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
