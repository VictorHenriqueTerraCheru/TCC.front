import { createContext, useContext } from 'react'

interface ValorPainel {
  /** A folha está no primeiro estágio (só o resumo à vista). */
  recolhido: boolean
  expandir(): void
  /**
   * Ref do bloco que forma o resumo: o primeiro estágio da folha passa a terminar logo abaixo
   * dele (mais a margem da área segura), em vez de usar a altura fixa.
   */
  medirResumo(elemento: HTMLElement | null): void
}

export const ContextoPainel = createContext<ValorPainel>({
  recolhido: false,
  expandir: () => {},
  medirResumo: () => {},
})

/** Para o conteúdo da folha: saber se está recolhida e expandi-la (ex.: tocar no card rápido). */
export function usePainelResponsivo() {
  return useContext(ContextoPainel)
}
