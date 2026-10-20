import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'

import { RecentesPage } from './recentes-page'

describe('RecentesPage', () => {
  it('chip de grupo liga e desliga o filtro', async () => {
    definirLargura(390)
    const usuario = userEvent.setup()
    renderizarRotas([{ path: '/recentes', element: <RecentesPage /> }], '/recentes')

    const chip = await screen.findByRole('button', { name: /Via pública/ })
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    await usuario.click(chip)
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await usuario.click(screen.getByRole('button', { name: /Via pública/ }))
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('falha em GET /grupos mostra erro com "Tentar novamente" em vez de lista sem filtros', async () => {
    definirLargura(390)
    server.use(http.get(rota('/grupos'), () => new HttpResponse(null, { status: 500 })))
    renderizarRotas([{ path: '/recentes', element: <RecentesPage /> }], '/recentes')

    expect(await screen.findByText('Não foi possível carregar os filtros.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
