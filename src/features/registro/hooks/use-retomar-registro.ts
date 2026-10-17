import { useEffect, useRef } from 'react'

import { useAutenticado, useConsumirAcaoPendente } from '@/features/auth'

type Passo = 'conferir' | 'enviar'

/**
 * Um 401 no meio do registro leva ao login com a ação guardada (`continuarRegistro`). De volta
 * ao passo, com sessão, este hook executa a ação uma vez: o registro não fica esquecido nem
 * pula a conferência de duplicatas.
 */
export function useRetomarRegistro(passo: Passo, acao: () => void) {
  const autenticado = useAutenticado()
  const consumirAcao = useConsumirAcaoPendente()
  const acaoRef = useRef(acao)
  useEffect(() => {
    acaoRef.current = acao
  })

  useEffect(() => {
    if (!autenticado) return
    const pendente = consumirAcao((a) => a.tipo === 'continuarRegistro' && a.passo === passo)
    if (pendente) acaoRef.current()
  }, [autenticado, consumirAcao, passo])
}
