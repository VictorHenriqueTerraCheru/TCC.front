import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useMediaQuery } from './use-media-query'

export type PreferenciaTema = 'automatico' | 'claro' | 'escuro'
export type Tema = 'claro' | 'escuro'

const COR_DA_BARRA: Record<Tema, string> = { claro: '#f2f2f7', escuro: '#121a24' }

interface TemaState {
  preferencia: PreferenciaTema
  escolhido: boolean
  definirPreferencia(preferencia: PreferenciaTema): void
  concluirEscolha(): void
}

export const useTemaStore = create<TemaState>()(
  persist(
    (set) => ({
      preferencia: 'automatico',
      escolhido: false,
      definirPreferencia: (preferencia) => set({ preferencia }),
      concluirEscolha: () => set({ escolhido: true }),
    }),
    {
      name: 'ocorrencias.tema',
      partialize: ({ preferencia, escolhido }) => ({ preferencia, escolhido }),
    },
  ),
)

export function useTema(): Tema {
  const preferencia = useTemaStore((s) => s.preferencia)
  const sistemaEscuro = useMediaQuery('(prefers-color-scheme: dark)')
  if (preferencia !== 'automatico') return preferencia
  return sistemaEscuro ? 'escuro' : 'claro'
}

export function useAplicarTema() {
  const tema = useTema()
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_DA_BARRA[tema])
  }, [tema])
}
