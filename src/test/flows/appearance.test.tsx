import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { routes } from '@/app/router'
import { useThemeStore } from '@/common/hooks/use-theme'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/session'

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

const option = (name: string) => screen.getByRole('radio', { name: new RegExp(name) })

describe('appearance (light, dark or system)', () => {
  beforeEach(() => {
    setWidth(390)
    useThemeStore.setState(useThemeStore.getInitialState())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.theme
  })

  it('on first open asks for the theme, with Automático checked, and returns to where it was', async () => {
    const user = userEvent.setup()
    const { router } = renderRoutes(routes, '/mapa?mode=both')

    expect(await screen.findByRole('heading', { name: 'Escolha a aparência' })).toBeInTheDocument()
    expect(option('Automático')).toHaveAttribute('aria-checked', 'true')

    await user.click(option('Escuro'))
    expect(option('Escuro')).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.dataset.theme).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(router.state.location.pathname).toBe('/mapa')
    expect(router.state.location.search).toBe('?mode=both')
    expect(useThemeStore.getState()).toMatchObject({ preference: 'dark', chosen: true })
  })

  it('once chosen, does not appear again', async () => {
    useThemeStore.setState({ chosen: true })
    renderRoutes(routes, '/mapa')

    expect(
      await screen.findByRole('radiogroup', { name: 'O que mostrar no mapa' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Escolha a aparência')).not.toBeInTheDocument()
  })

  it('comes before the location pre-permission', async () => {
    browserPrompting()
    const user = userEvent.setup()
    renderRoutes(routes, '/mapa')

    expect(await screen.findByRole('heading', { name: 'Escolha a aparência' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByRole('heading', { name: 'Permitir acesso à sua localização?' }),
    ).toBeInTheDocument()
  })

  it('Configurações switches the theme immediately', async () => {
    useThemeStore.setState({ preference: 'dark', chosen: true })
    loginAsCitizen()
    const user = userEvent.setup()
    renderRoutes(routes, '/perfil/configuracoes')

    expect(await screen.findByRole('radiogroup', { name: 'Aparência' })).toBeInTheDocument()
    expect(option('Escuro')).toHaveAttribute('aria-checked', 'true')

    await user.click(option('Claro'))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(useThemeStore.getState().preference).toBe('light')
    logout()
  })
})
