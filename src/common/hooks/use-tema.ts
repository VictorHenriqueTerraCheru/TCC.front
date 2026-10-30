import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useMediaQuery } from './use-media-query'

export type ThemePreference = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

const BAR_COLOR: Record<Theme, string> = { light: '#f2f2f7', dark: '#121a24' }

interface ThemeState {
  preference: ThemePreference
  chosen: boolean
  setPreference(preference: ThemePreference): void
  completeChoice(): void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      chosen: false,
      setPreference: (preference) => set({ preference }),
      completeChoice: () => set({ chosen: true }),
    }),
    {
      name: 'ocorrencias.tema',
      partialize: ({ preference, chosen }) => ({ preference, chosen }),
    },
  ),
)

export function useTheme(): Theme {
  const preference = useThemeStore((s) => s.preference)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  if (preference !== 'system') return preference
  return systemDark ? 'dark' : 'light'
}

export function useApplyTheme() {
  const theme = useTheme()
  useEffect(() => {
    document.documentElement.dataset.tema = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOR[theme])
  }, [theme])
}
