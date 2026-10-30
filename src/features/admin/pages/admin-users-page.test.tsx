import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { route } from '@/infrastructure/mocks/route'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsAdmin, loginAsCitizen, logout } from '@/test/session'

import { AdminUsersPage } from './admin-users-page'

function openAt() {
  setWidth(390)
  return renderRoutes([{ path: '/admin/users', element: <AdminUsersPage /> }], '/admin/users')
}

const card = (name: string) => screen.findByRole('article', { name: `Usuário ${name}` })

describe('user administration', () => {
  beforeEach(loginAsAdmin)
  afterEach(logout)

  it('regular citizen cannot enter', async () => {
    logout()
    loginAsCitizen()
    openAt()

    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('lists the users with e-mail and role', async () => {
    openAt()

    const ana = await card('Ana Lima')
    expect(within(ana).getByText('cidadao1@tcc.local')).toBeInTheDocument()
    expect(within(ana).getByText('Cidadão')).toBeInTheDocument()
    const mariana = await card('Mariana Souza')
    expect(within(mariana).getByText('Perfil verificado')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('searches by name or e-mail', async () => {
    const user = userEvent.setup()
    openAt()
    await card('Ana Lima')

    await user.type(screen.getByRole('searchbox', { name: 'Buscar usuário' }), 'mariana')

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(await card('Mariana Souza')).toBeInTheDocument()
  })

  it('filters by role', async () => {
    const user = userEvent.setup()
    openAt()
    await card('Ana Lima')

    await user.click(screen.getByRole('radio', { name: 'Admin' }))

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1))
    expect(await card('Admin TCC')).toBeInTheDocument()
  })

  it("changes a user's role and the list reflects the change", async () => {
    const user = userEvent.setup()
    openAt()
    const ana = await card('Ana Lima')

    await user.click(within(ana).getByRole('button', { name: 'Alterar perfil' }))
    await user.click(await screen.findByRole('radio', { name: /Perfil verificado/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(async () =>
      expect(within(await card('Ana Lima')).getByText('Perfil verificado')).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument()
  })

  it("does not offer changing one's own role", async () => {
    openAt()

    const ownCard = await card('Admin TCC')

    expect(
      within(ownCard).queryByRole('button', { name: 'Alterar perfil' }),
    ).not.toBeInTheDocument()
    expect(within(ownCard).getByText('Você')).toBeInTheDocument()
  })

  it('shows the API error on save and keeps the sheet open', async () => {
    server.use(
      http.patch(route('/admin/users/:id/role'), () =>
        HttpResponse.json(
          { type: 'own-role', title: 'x', status: 422 },
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const user = userEvent.setup()
    openAt()
    const ana = await card('Ana Lima')

    await user.click(within(ana).getByRole('button', { name: 'Alterar perfil' }))
    await user.click(await screen.findByRole('radio', { name: /Administrador/ }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você não pode alterar o seu próprio perfil.',
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('loading failure shows "Tentar novamente"', async () => {
    server.use(http.get(route('/admin/users'), () => new HttpResponse(null, { status: 500 })))
    openAt()

    expect(await screen.findByText('Não foi possível carregar os usuários.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
