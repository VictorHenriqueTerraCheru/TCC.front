import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { clearIconCache } from '@/common/lib/iconify'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsAdmin, loginAsCitizen, logout } from '@/test/sessao'

import { AdminCategoriesPage } from './categorias-admin-page'

const ICONIFY = 'https://api.iconify.design'

function fakeIconify() {
  server.use(
    http.get(`${ICONIFY}/search`, () =>
      HttpResponse.json({
        icons: ['material-symbols:ico-a-rounded', 'material-symbols:ico-a-sharp'],
      }),
    ),
    http.get(`${ICONIFY}/material-symbols.json`, () =>
      HttpResponse.json({
        width: 24,
        icons: { 'ico-a-rounded': { body: '<path d="M1 1h4v4z"/>' } },
      }),
    ),
  )
}

function openAt() {
  setWidth(390)
  return renderRoutes(
    [{ path: '/admin/categorias', element: <AdminCategoriesPage /> }],
    '/admin/categorias',
  )
}

describe('categories and groups administration', () => {
  beforeEach(() => {
    loginAsAdmin()
    clearIconCache()
  })
  afterEach(logout)

  it('regular citizen cannot enter', async () => {
    logout()
    loginAsCitizen()
    openAt()

    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nova categoria' })).not.toBeInTheDocument()
  })

  it('failure on GET /grupos shows an error with "Tentar novamente" instead of raw keys', async () => {
    server.use(http.get(route('/groups'), () => new HttpResponse(null, { status: 500 })))
    openAt()

    expect(await screen.findByText('Não foi possível carregar os grupos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nova categoria' })).not.toBeInTheDocument()
  })

  it('on the Grupos tab, failure on GET /admin/categorias shows an error instead of locking delete', async () => {
    server.use(http.get(route('/admin/categories'), () => new HttpResponse(null, { status: 500 })))
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('radio', { name: 'Grupos' }))

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('guest goes to login', async () => {
    logout()
    const { router } = openAt()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('lists the categories with group and type', async () => {
    openAt()

    const line = (await screen.findByText('Buraco na via')).closest('li')!
    expect(within(line).getByText('Estado')).toBeInTheDocument()
    expect(within(line).getByText('Via pública')).toBeInTheDocument()
    const roubo = screen.getByText('Roubo').closest('li')!
    expect(within(roubo).getByText('Evento')).toBeInTheDocument()
    expect(within(roubo).getByText('Segurança')).toBeInTheDocument()
  })

  it('creates a group and then a category in it, with an icon searched on Iconify', async () => {
    fakeIconify()
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('radio', { name: 'Grupos' }))
    await user.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await user.type(await screen.findByLabelText('Nome do grupo'), 'Clima')
    await user.click(screen.getByRole('radio', { name: 'Evento' }))
    await user.click(screen.getByRole('radio', { name: 'Azul' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Clima')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Categorias' }))
    await user.click(await screen.findByRole('button', { name: 'Nova categoria' }))
    await user.type(await screen.findByLabelText('Nome'), 'Rua inundada')
    await user.click(screen.getByRole('radio', { name: 'Evento' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Grupo' })).getByRole('button', { name: 'Clima' }),
    )
    await user.type(screen.getByRole('searchbox', { name: 'Buscar ícone' }), 'inundacao')
    const results = await screen.findByRole('group', { name: 'Resultados da busca' })
    expect(within(results).getAllByRole('button')).toHaveLength(1)
    await user.click(within(results).getByRole('button', { name: 'ico_a' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    const line = (await screen.findByText('Rua inundada')).closest('li')!
    expect(within(line).getByText('Evento')).toBeInTheDocument()
    expect(within(line).getByText('Clima')).toBeInTheDocument()
    await waitFor(() => expect(line.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'))
  })

  it('category form shows the validation errors', async () => {
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('button', { name: 'Nova categoria' }))
    await user.click(await screen.findByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Escolha o grupo.')).toBeInTheDocument()
    expect(screen.getByText('Escolha um ícone.')).toBeInTheDocument()
  })

  it('duplicate name shows the API message', async () => {
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('button', { name: 'Editar Calçada danificada' }))
    const name = await screen.findByLabelText('Nome')
    await user.clear(name)
    await user.type(name, 'buraco na via')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Já existe uma categoria com este nome.')).toBeInTheDocument()
  })

  it('editing does not allow changing the type and saves the new name', async () => {
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('button', { name: 'Editar Fio caído' }))
    expect(await screen.findByText(/O tipo não muda depois de criada/)).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Evento' })).not.toBeInTheDocument()
    const name = screen.getByLabelText('Nome')
    await user.clear(name)
    await user.type(name, 'Fio solto')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Fio solto')).toBeInTheDocument()
    expect(screen.queryByText('Fio caído')).not.toBeInTheDocument()
  })

  it('deactivating marks as inactive and activating restores it', async () => {
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('button', { name: 'Desativar Lixo acumulado' }))
    expect((await screen.findByText('Lixo acumulado')).closest('li')).toHaveTextContent('Inativa')

    await user.click(screen.getByRole('button', { name: 'Ativar Lixo acumulado' }))
    await waitFor(() =>
      expect(screen.getByText('Lixo acumulado').closest('li')).not.toHaveTextContent('Inativa'),
    )
  })

  it('only deletes an empty group: with categories the button is disabled', async () => {
    const user = userEvent.setup()
    openAt()

    await user.click(await screen.findByRole('radio', { name: 'Grupos' }))
    expect(await screen.findByRole('button', { name: 'Apagar Limpeza' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await user.type(await screen.findByLabelText('Nome do grupo'), 'Provisório')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await user.click(await screen.findByRole('button', { name: 'Apagar Provisório' }))
    await user.click(await screen.findByRole('button', { name: 'Apagar' }))
    await waitFor(() => expect(screen.queryByText('Provisório')).not.toBeInTheDocument())
  })

  it('group in use (someone else created a category) shows the reason on delete', async () => {
    server.use(
      http.delete(route('/admin/groups/:key'), () =>
        HttpResponse.json(
          { type: 'group-in-use', title: 'x', status: 409 },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const user = userEvent.setup()
    openAt()
    await user.click(await screen.findByRole('radio', { name: 'Grupos' }))
    await user.click(screen.getByRole('button', { name: 'Novo grupo' }))
    await user.type(await screen.findByLabelText('Nome do grupo'), 'Vazio')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await user.click(await screen.findByRole('button', { name: 'Apagar Vazio' }))
    await user.click(await screen.findByRole('button', { name: 'Apagar' }))

    expect(await screen.findByText(/ainda tem categorias/)).toBeInTheDocument()
  })

  it('loading failure shows try again', async () => {
    server.use(http.get(route('/admin/categories'), () => new HttpResponse(null, { status: 500 })))
    openAt()

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
  })

  it('Estado and Evento have labels of different colors', async () => {
    openAt()

    const state = within((await screen.findByText('Buraco na via')).closest('li')!).getByText(
      'Estado',
    )
    const event = within(screen.getByText('Roubo').closest('li')!).getByText('Evento')
    expect(state.className).toContain('text-primario')
    expect(event.className).toContain('text-cat-roxo')
  })

  describe('category search and filters', () => {
    const visibleNames = () =>
      screen
        .getAllByRole('button', { name: /^Editar / })
        .map((b) => b.getAttribute('aria-label')!.replace('Editar ', ''))

    it('searches by name or group, ignoring accents', async () => {
      const user = userEvent.setup()
      openAt()
      await screen.findByText('Buraco na via')

      await user.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'calcada')
      expect(visibleNames()).toEqual(['Calçada danificada'])

      await user.clear(screen.getByRole('searchbox', { name: 'Buscar categoria' }))
      await user.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'eletrica')
      expect(visibleNames()).toEqual(['Fio caído', 'Poste apagado'])
      expect(screen.getByText('2 de 8 categorias')).toBeInTheDocument()
    })

    it('filters by type and the group chips follow the type', async () => {
      const user = userEvent.setup()
      openAt()
      await screen.findByText('Buraco na via')

      await user.click(screen.getByRole('radio', { name: 'Evento' }))
      expect(visibleNames()).toEqual(['Roubo', 'Acidente de trânsito'])
      const chips = within(screen.getByRole('group', { name: 'Filtrar por grupo' }))
      expect(chips.getByRole('button', { name: 'Segurança' })).toBeInTheDocument()
      expect(chips.queryByRole('button', { name: 'Limpeza' })).not.toBeInTheDocument()

      await user.click(chips.getByRole('button', { name: 'Trânsito' }))
      expect(visibleNames()).toEqual(['Acidente de trânsito'])

      await user.click(screen.getByRole('radio', { name: 'Estado' }))
      expect(visibleNames()).toHaveLength(6)
    })

    it('filters by status and Limpar filtros resets everything', async () => {
      const user = userEvent.setup()
      openAt()
      await user.click(await screen.findByRole('button', { name: 'Desativar Roubo' }))
      await screen.findByRole('button', { name: 'Ativar Roubo' })

      await user.click(screen.getByRole('radio', { name: 'Inativas' }))
      expect(visibleNames()).toEqual(['Roubo'])
      await user.click(screen.getByRole('radio', { name: 'Ativas' }))
      expect(visibleNames()).not.toContain('Roubo')

      await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
      expect(visibleNames()).toContain('Roubo')
      expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
    })

    it('no result shows a notice', async () => {
      const user = userEvent.setup()
      openAt()
      await screen.findByText('Buraco na via')

      await user.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'zzz')

      expect(screen.getByText('Nenhuma categoria com esses filtros.')).toBeInTheDocument()
    })
  })

  describe('group search and filters', () => {
    it('searches by name and filters by type', async () => {
      const user = userEvent.setup()
      openAt()
      await user.click(await screen.findByRole('radio', { name: 'Grupos' }))
      await screen.findByText('Via pública')

      await user.type(screen.getByRole('searchbox', { name: 'Buscar grupo' }), 'transito')
      expect(screen.getByRole('button', { name: 'Editar Trânsito' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar Limpeza' })).not.toBeInTheDocument()

      await user.clear(screen.getByRole('searchbox', { name: 'Buscar grupo' }))
      await user.click(screen.getByRole('radio', { name: 'Estado' }))
      expect(screen.getByRole('button', { name: 'Editar Limpeza' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar Segurança' })).not.toBeInTheDocument()
      expect(screen.getByText('3 de 5 grupos')).toBeInTheDocument()
    })
  })
})
