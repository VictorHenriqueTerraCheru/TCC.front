import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Horario } from '../models/horario'

export interface Ponto {
  lat: number
  lng: number
}

interface RascunhoState {
  categoryId: number | null
  local: Ponto | null
  description: string
  horario: Horario
  escolherCategoria(id: number): void
  definirLocal(local: Ponto): void
  definirDescricao(descricao: string): void
  definirHorario(horario: Horario): void
  limpar(): void
}

const vazio = {
  categoryId: null,
  local: null,
  description: '',
  horario: { modo: 'agora', outroEm: null } satisfies Horario,
}

export const useRascunhoStore = create<RascunhoState>()(
  persist(
    (set) => ({
      ...vazio,
      escolherCategoria: (categoriaId) => set({ categoryId: categoriaId }),
      definirLocal: (local) =>
        set((s) => (s.local?.lat === local.lat && s.local.lng === local.lng ? s : { local })),
      definirDescricao: (descricao) => set({ description: descricao }),
      definirHorario: (horario) => set({ horario }),
      limpar: () => set(vazio),
    }),
    { name: 'ocorrencias.rascunhoRegistro', storage: createJSONStorage(() => sessionStorage) },
  ),
)
