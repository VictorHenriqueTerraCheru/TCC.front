import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const MAXIMO = 6

interface RecentesState {
  ids: number[]
  registrar(id: number): void
}

export const useRecentesStore = create<RecentesState>()(
  persist(
    (set) => ({
      ids: [],
      registrar: (id) =>
        set((s) => ({ ids: [id, ...s.ids.filter((i) => i !== id)].slice(0, MAXIMO) })),
    }),
    {
      name: 'ocorrencias.categoriasRecentes',
      storage: createJSONStorage(() => localStorage),
      merge: (salvo, atual) => {
        const ids = (salvo as Partial<RecentesState> | undefined)?.ids
        return {
          ...atual,
          ids: Array.isArray(ids) ? ids.filter((i) => Number.isInteger(i)).slice(0, MAXIMO) : [],
        }
      },
    },
  ),
)
