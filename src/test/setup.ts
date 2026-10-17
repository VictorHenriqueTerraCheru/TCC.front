import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

import { provedorAutenticacao } from '@/features/auth'
import { registrarAutenticacao } from '@/infrastructure/api'
import { banco } from '@/infrastructure/mocks/banco'
import { server } from '@/infrastructure/mocks/server'

// jsdom não tem WebGL: o mapa vira um falso que imita a API usada pelo app.
vi.mock('@vis.gl/react-maplibre', () => import('./maplibre-falso'))

// Mesma composição do main.tsx.
registrarAutenticacao(provedorAutenticacao)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  banco.reiniciar()
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

// vaul (Drawer) usa pointer capture, que o jsdom não implementa.
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
