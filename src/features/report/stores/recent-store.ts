import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const MAX = 6

interface RecentState {
  ids: number[]
  report(id: number): void
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      report: (id) => set((s) => ({ ids: [id, ...s.ids.filter((i) => i !== id)].slice(0, MAX) })),
    }),
    {
      name: 'urbanReports.recentCategories',
      storage: createJSONStorage(() => localStorage),
      merge: (saved, current) => {
        const ids = (saved as Partial<RecentState> | undefined)?.ids
        return {
          ...current,
          ids: Array.isArray(ids) ? ids.filter((i) => Number.isInteger(i)).slice(0, MAX) : [],
        }
      },
    },
  ),
)
