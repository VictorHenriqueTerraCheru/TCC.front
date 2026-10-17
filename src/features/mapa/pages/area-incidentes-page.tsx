import { useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'

import { PainelResponsivo } from '@/common/components/painel-responsivo'
import { AreaIncidentes } from '@/features/incidentes'

import { useNavegacaoMapa } from '../hooks/use-navegacao-mapa'
import type { ContextoMapa } from '../models/contexto'

/** Tela 4: /mapa/area?lat&lng. */
export function AreaIncidentesPage() {
  const [params] = useSearchParams()
  const { focar } = useOutletContext<ContextoMapa>()
  const { fechar } = useNavegacaoMapa()
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  const valido =
    Number.isFinite(lat) && Number.isFinite(lng) && params.has('lat') && params.has('lng')

  useEffect(() => {
    if (valido) focar({ lat, lng })
  }, [valido, lat, lng, focar])

  if (!valido) return null
  return (
    <PainelResponsivo titulo="Área de incidentes" aoFechar={fechar}>
      <AreaIncidentes lat={lat} lng={lng} />
    </PainelResponsivo>
  )
}
