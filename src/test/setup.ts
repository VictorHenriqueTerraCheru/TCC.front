import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

import { server } from '@/infrastructure/mocks/server'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

// jsdom não tem matchMedia. Os testes escolhem a largura com definirLargura() (src/test/render.tsx).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (consulta: string) => {
    const minimo = /min-width:\s*(\d+)px/.exec(consulta)?.[1]
    return {
      matches: minimo !== undefined && window.innerWidth >= Number(minimo),
      media: consulta,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }
  },
})
