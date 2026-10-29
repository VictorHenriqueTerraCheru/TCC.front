import { useLocation } from 'react-router'

import { useGuardaStore, type AcaoPendente, type MotivoConta } from '../stores/guarda-store'
import { sessaoAtual } from '../stores/sessao-store'

interface OpcoesGuarda {
  pending?: AcaoPendente
  retorno?: string
}

export function useExigirConta() {
  const location = useLocation()

  return (motivo: MotivoConta, acao: () => void, opcoes: OpcoesGuarda = {}) => {
    if (sessaoAtual()) {
      acao()
      return
    }
    const guarda = useGuardaStore.getState()
    guarda.pedirConta(
      motivo,
      {
        retorno: opcoes.retorno ?? `${location.pathname}${location.search}`,
        acao: opcoes.pending ?? null,
      },
      guarda.expirou,
    )
  }
}

export function useConsumirAcaoPendente() {
  return useGuardaStore((s) => s.consumirAcao)
}
