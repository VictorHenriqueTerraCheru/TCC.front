import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { routes } from '@/app/router'
import { setWidth, renderRoutes } from '@/test/render'

function browserPrompting() {
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: { getCurrentPosition: vi.fn(), watchPosition: vi.fn(), clearWatch: vi.fn() },
    permissions: {
      query: () =>
        Promise.resolve({ state: 'prompt', addEventListener() {}, removeEventListener() {} }),
    },
  })
}

describe('location pre-permission (screen 17)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('on first open in prompt, explains before asking; "Agora não" goes back to the map', async () => {
    browserPrompting()
    setWidth(390)
    const user = userEvent.setup()
    const { router } = renderRoutes(routes, '/mapa?mode=both')

    expect(
      await screen.findByRole('heading', { name: 'Permitir acesso à sua localização?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Agora não' }))

    expect(router.state.location.pathname).toBe('/mapa')
    expect(router.state.location.search).toBe('?mode=both')
    expect(localStorage.getItem('ocorrencias.prePermissaoVista')).toBe('1')
  })

  it('once seen, does not appear again', async () => {
    browserPrompting()
    localStorage.setItem('ocorrencias.prePermissaoVista', '1')
    setWidth(390)
    renderRoutes(routes, '/mapa')

    expect(
      await screen.findByRole('radiogroup', { name: 'O que mostrar no mapa' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Permitir acesso à sua localização?')).not.toBeInTheDocument()
  })
})
