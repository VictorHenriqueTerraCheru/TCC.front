import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useMediaQuery } from './use-media-query'

export type PreferenciaTema = 'automatico' | 'claro' | 'escuro'
export type Tema = 'claro' | 'escuro'

/** Cor da barra do navegador/celular (meta theme-color): o --background de cada tema. */
const COR_DA_BARRA: Record<Tema, string> = { claro: '#f2f2f7', escuro: '#121a24' }

interface TemaState {
  preferencia: PreferenciaTema
  /** false até a pessoa passar pela tela "Escolha a aparência" na primeira abertura. */
  escolhido: boolean
  definirPreferencia(preferencia: PreferenciaTema): void
  concluirEscolha(): void
}

/**
 * Preferência de tema. A chave e o formato (`{ state: { preferencia } }`) também são lidos pelo
 * script do index.html, que aplica o tema antes da primeira pintura (sem piscar).
 */
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

/** Tema em uso: a preferência, ou o do sistema (prefers-color-scheme) no automático. */
export function useTema(): Tema {
  const preferencia = useTemaStore((s) => s.preferencia)
  const sistemaEscuro = useMediaQuery('(prefers-color-scheme: dark)')
  if (preferencia !== 'automatico') return preferencia
  return sistemaEscuro ? 'escuro' : 'claro'
}

/** Aplica o tema no <html> (tokens do index.css) e na barra do navegador; montado no RaizLayout. */
export function useAplicarTema() {
  const tema = useTema()
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_DA_BARRA[tema])
  }, [tema])
}
