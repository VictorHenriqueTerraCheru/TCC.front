import { useLocation } from 'react-router'

import { useGuardaStore, type AcaoPendente, type MotivoConta } from '../stores/guarda-store'
import { useSessaoStore } from '../stores/sessao-store'

interface OpcoesGuarda {
  /** Ação a retomar depois do login (votos). */
  pendente?: AcaoPendente
  /** Para onde voltar; padrão: a rota atual. */
  retorno?: string
}

/**
 * Regra 1 — visitante vê, conta age. Com sessão, executa a ação; sem sessão, guarda a ação
 * pendente e abre a folha "Entre para votar/registrar". Lê a sessão no momento da chamada:
 * se um 401 acabou de limpá-la (regra 13), a mesma chamada abre a folha.
 */
export function useExigirConta() {
  const location = useLocation()

  return (motivo: MotivoConta, acao: () => void, opcoes: OpcoesGuarda = {}) => {
    if (useSessaoStore.getState().sessao) {
      acao()
      return
    }
    const guarda = useGuardaStore.getState()
    guarda.pedirConta(
      motivo,
      {
        retorno: opcoes.retorno ?? `${location.pathname}${location.search}`,
        acao: opcoes.pendente ?? null,
      },
      guarda.expirou,
    )
  }
}

/** Para a tela de destino: executa (uma vez) a ação pendente que for dela. */
export function useConsumirAcaoPendente() {
  return useGuardaStore((s) => s.consumirAcao)
}
