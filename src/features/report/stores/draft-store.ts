import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { OccurrenceTime } from '../models/time'

export interface Point {
  lat: number
  lng: number
}

interface DraftState {
  categoryId: number | null
  location: Point | null
  description: string
  time: OccurrenceTime
  chooseCategory(id: number): void
  setLocation(location: Point): void
  setDescription(description: string): void
  setTime(time: OccurrenceTime): void
  clear(): void
}

const empty = {
  categoryId: null,
  location: null,
  description: '',
  time: { mode: 'now', otherAt: null } satisfies OccurrenceTime,
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...empty,
      chooseCategory: (categoryId) => set({ categoryId }),
      setLocation: (location) =>
        set((s) =>
          s.location?.lat === location.lat && s.location.lng === location.lng ? s : { location },
        ),
      setDescription: (description) => set({ description }),
      setTime: (time) => set({ time }),
      clear: () => set(empty),
    }),
    { name: 'urbanReports.reportDraft', storage: createJSONStorage(() => sessionStorage) },
  ),
)
