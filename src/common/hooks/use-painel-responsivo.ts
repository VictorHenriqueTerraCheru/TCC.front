import { createContext, useContext } from 'react'

interface ValorPainel {
  recolhido: boolean
  expandir(): void
  medirResumo(elemento: HTMLElement | null): void
}

export const ContextoPainel = createContext<ValorPainel>({
  recolhido: false,
  expandir: () => {},
  medirResumo: () => {},
})

export function usePainelResponsivo() {
  return useContext(ContextoPainel)
}
