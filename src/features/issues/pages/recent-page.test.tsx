import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { route } from '@/infrastructure/mocks/route'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'

import { RecentPage } from './recent-page'

describe('RecentPage', () => {
  it('group chip toggles the filter', async () => {
    setWidth(390)
    const user = userEvent.setup()
    renderRoutes([{ path: '/recentes', element: <RecentPage /> }], '/recentes')

    const chip = await screen.findByRole('button', { name: /Via pública/ })
    expect(chip).toHaveAttribute('aria-pressed', 'false')

    await user.click(chip)
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /Via pública/ }))
    expect(screen.getByRole('button', { name: /Via pública/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('failure on GET /grupos shows an error with "Tentar novamente" instead of a list without filters', async () => {
    setWidth(390)
    server.use(http.get(route('/groups'), () => new HttpResponse(null, { status: 500 })))
    renderRoutes([{ path: '/recentes', element: <RecentPage /> }], '/recentes')

    expect(await screen.findByText('Não foi possível carregar os filtros.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
