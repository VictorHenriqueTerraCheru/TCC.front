import { createContext, useContext } from 'react'

interface PanelValue {
  collapsed: boolean
  expand(): void
  measureSummary(element: HTMLElement | null): void
}

export const PanelContext = createContext<PanelValue>({
  collapsed: false,
  expand: () => {},
  measureSummary: () => {},
})

export function useResponsivePanel() {
  return useContext(PanelContext)
}
