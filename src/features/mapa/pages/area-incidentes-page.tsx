import { useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'

import { PainelResponsivo } from '@/common/components/painel-responsivo'
import { AreaIncidentes } from '@/features/incidentes'

import { useNavegacaoMapa } from '../hooks/use-navegacao-mapa'
import type { ContextoMapa } from '../models/contexto'
import { pontoDaUrl } from '../models/ponto'

export function AreaIncidentesPage() {
  const [params] = useSearchParams()
  const { focar } = useOutletContext<ContextoMapa>()
  const { fechar } = useNavegacaoMapa()
  const ponto = pontoDaUrl(params)
  const lat = ponto?.lat
  const lng = ponto?.lng

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) focar({ lat, lng })
  }, [lat, lng, focar])

  if (lat === undefined || lng === undefined) return null
  return (
    <PainelResponsivo titulo="Área de incidentes" aoFechar={fechar}>
      <AreaIncidentes lat={lat} lng={lng} />
    </PainelResponsivo>
  )
}
