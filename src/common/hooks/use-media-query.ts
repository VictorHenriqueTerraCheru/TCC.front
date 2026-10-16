import { useSyncExternalStore } from 'react'

export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const media = window.matchMedia(consulta)
      media.addEventListener('change', avisar)
      return () => media.removeEventListener('change', avisar)
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}

/** Breakpoint único do layout (regra 8 do CLAUDE.md): lg, ≥ 1024 px. */
export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
