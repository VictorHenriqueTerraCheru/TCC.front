import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'

import { useThemeStore } from '@/common/hooks/use-tema'
import { authProvider } from '@/features/auth'
import { registerAuthProvider } from '@/infrastructure/api'
import { database } from '@/infrastructure/mocks/banco'
import { server } from '@/infrastructure/mocks/server'

vi.mock('@vis.gl/react-maplibre', () => import('./maplibre-falso'))

MotionGlobalConfig.skipAnimations = true

registerAuthProvider(authProvider)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
beforeEach(() => useThemeStore.setState({ preference: 'system', chosen: true }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  database.reset()
  localStorage.clear()
})
afterAll(() => server.close())

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    const minimum = /min-width:\s*(\d+)px/.exec(query)?.[1]
    return {
      matches: minimum !== undefined && window.innerWidth >= Number(minimum),
      medium: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }
  },
})

Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.hasPointerCapture ??= () => false

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
