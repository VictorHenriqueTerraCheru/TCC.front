import { screen, within } from '@testing-library/react'

import { definirLargura, renderizarRotas } from '@/test/render'

import { rotas } from '../router'

describe('AppLayout', () => {
  it('no celular mostra a barra inferior e o FAB Registrar no mapa', async () => {
    definirLargura(390)
    renderizarRotas(rotas, '/')

    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' })
    for (const rotulo of ['Mapa', 'Recentes', 'Perfil']) {
      expect(within(nav).getByRole('link', { name: new RegExp(rotulo) })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('link', { name: /Mapa/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Registrar/ })).toHaveAttribute('href', '/registrar')
  })

  it('no desktop mostra o trilho com o botão Registrar em destaque', async () => {
    definirLargura(1440)
    renderizarRotas(rotas, '/recentes')

    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' })
    expect(within(nav).getByRole('link', { name: 'Registrar ocorrência' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Recentes/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('heading', { name: 'Recentes' })).toBeInTheDocument()
  })
})
