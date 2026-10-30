import { screen, within } from '@testing-library/react'

import { setWidth, renderRoutes } from '@/test/render'

import { routes } from '../router'

describe('AppLayout', () => {
  it('on mobile shows the bottom bar and the Registrar FAB on the map', async () => {
    setWidth(390)
    renderRoutes(routes, '/')

    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' })
    for (const label of ['Mapa', 'Recentes', 'Perfil']) {
      expect(within(nav).getByRole('link', { name: new RegExp(label) })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('link', { name: /Mapa/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Registrar/ })).toHaveAttribute('href', '/report')
  })

  it('on desktop shows the rail with the Registrar button highlighted', async () => {
    setWidth(1440)
    renderRoutes(routes, '/recent')

    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' })
    expect(within(nav).getByRole('link', { name: 'Registrar ocorrência' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Recentes/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('heading', { name: 'Recentes' })).toBeInTheDocument()
  })
})
