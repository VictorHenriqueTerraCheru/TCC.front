import { useEffect } from 'react'
import { useOutletContext, useParams } from 'react-router'

import { PainelResponsivo } from '@/common/components/painel-responsivo'
import { DetalheProblema, useDetalheProblema } from '@/features/problemas'

import { useNavegacaoMapa } from '../hooks/use-navegacao-mapa'
import type { ContextoMapa } from '../models/contexto'

/** Telas 3, 19, 22 e 23: /mapa/problema/:id. */
export function DetalheProblemaPage() {
  const { id = '' } = useParams()
  const { focar } = useOutletContext<ContextoMapa>()
  const { fechar } = useNavegacaoMapa()
  const { data } = useDetalheProblema(id)

  const lat = data?.lat
  const lng = data?.lng
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) focar({ lat, lng })
  }, [id, lat, lng, focar])

  return (
    <PainelResponsivo titulo="Detalhe do problema" aoFechar={fechar}>
      <DetalheProblema id={id} />
    </PainelResponsivo>
  )
}
