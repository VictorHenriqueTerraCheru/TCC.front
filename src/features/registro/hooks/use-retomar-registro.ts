import { useEffect, useRef } from 'react'

import { useAutenticado, useConsumirAcaoPendente } from '@/features/auth'

type Passo = 'conferir' | 'enviar'

export function useRetomarRegistro(passo: Passo, acao: () => void) {
  const autenticado = useAutenticado()
  const consumirAcao = useConsumirAcaoPendente()
  const acaoRef = useRef(acao)
  useEffect(() => {
    acaoRef.current = acao
  })

  useEffect(() => {
    if (!autenticado) return
    const pendente = consumirAcao((a) => a.type === 'continuarRegistro' && a.passo === passo)
    if (pendente) acaoRef.current()
  }, [autenticado, consumirAcao, passo])
}
