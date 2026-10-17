import { createContext, useContext } from 'react'

interface ValorPainel {
  /** A folha está no primeiro estágio (só o resumo à vista). */
  recolhido: boolean
  expandir(): void
}

export const ContextoPainel = createContext<ValorPainel>({ recolhido: false, expandir: () => {} })

/** Para o conteúdo da folha: saber se está recolhida e expandi-la (ex.: tocar no card rápido). */
export function usePainelResponsivo() {
  return useContext(ContextoPainel)
}
