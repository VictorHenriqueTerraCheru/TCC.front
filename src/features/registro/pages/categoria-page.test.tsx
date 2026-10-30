import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { routes } from '@/app/router'
import { categories } from '@/infrastructure/mocks/fixtures/categorias'
import { groups } from '@/infrastructure/mocks/fixtures/grupos'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/sessao'

import { useDraftStore } from '../stores/rascunho-store'

function openAt(path: string) {
  setWidth(390)
  return renderRoutes(routes, path)
}

describe('step 1: type and category', () => {
  beforeEach(loginAsCitizen)
  afterEach(() => {
    logout()
    useDraftStore.getState().clear()
    sessionStorage.clear()
  })

  it('the type screen leads to the category list of the chosen type', async () => {
    const user = userEvent.setup()
    const { router } = openAt('/registrar')

    await user.click(await screen.findByRole('link', { name: /^Evento/ }))

    expect(router.state.location.pathname + router.state.location.search).toBe(
      '/registrar/categoria?type=incident',
    )
    expect(await screen.findByRole('button', { name: 'Roubo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buraco na via' })).not.toBeInTheDocument()
  })

  it('missing or invalid type goes back to choosing the type', async () => {
    const { router } = openAt('/registrar/categoria?type=qualquer')

    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar'))
    expect(await screen.findByRole('heading', { name: 'Estado ou evento?' })).toBeInTheDocument()
  })

  it('shows the categories of the type grouped, one section per group, in API order', async () => {
    openAt('/registrar/categoria?type=issue')

    for (const group of ['Via pública', 'Elétrica', 'Limpeza']) {
      expect(await screen.findByRole('region', { name: group })).toBeInTheDocument()
    }
    const buttons = within(screen.getByRole('region', { name: 'Via pública' })).getAllByRole(
      'button',
    )
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveAccessibleName('Buraco na via')
    expect(buttons[1]).toHaveAccessibleName('Calçada danificada')
    expect(screen.queryByRole('region', { name: 'Segurança' })).not.toBeInTheDocument()
  })

  it('group chip filters the sections; tapping again goes back to Todas', async () => {
    const user = userEvent.setup()
    openAt('/registrar/categoria?type=issue')

    await user.click(await screen.findByRole('button', { name: 'Elétrica' }))
    expect(screen.queryByRole('region', { name: 'Limpeza' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Elétrica' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Elétrica' }))
    expect(screen.getByRole('region', { name: 'Limpeza' })).toBeInTheDocument()
  })

  it('search ignores accents and case and shows a notice when nothing is found', async () => {
    const user = userEvent.setup()
    openAt('/registrar/categoria?type=issue')

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar categoria' }), 'CALCADA')
    expect(screen.getByRole('button', { name: 'Calçada danificada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buraco na via' })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Buscar categoria' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar categoria' }), 'xyz')
    expect(screen.getByText(/Nenhuma categoria com esse nome/)).toBeInTheDocument()
  })

  it('Continuar only enables with a category; goes to the location and becomes "Recente" next time', async () => {
    const user = userEvent.setup()
    const { router } = openAt('/registrar/categoria?type=issue')

    const proceed = await screen.findByRole('button', { name: 'Continuar' })
    expect(proceed).toBeDisabled()

    await user.click(await screen.findByRole('button', { name: 'Poste apagado' }))
    expect(screen.getByText('Selecionada: Poste apagado')).toBeInTheDocument()
    await user.click(proceed)
    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar/local'))

    await router.navigate('/registrar/categoria?type=issue')
    const recent = await screen.findByRole('region', { name: 'Recentes' })
    expect(
      within(recent).getByRole('button', { name: 'Recente: Poste apagado' }),
    ).toBeInTheDocument()
  })

  it('draft of another type does not count as a choice', async () => {
    useDraftStore.getState().chooseCategory(7)
    openAt('/registrar/categoria?type=issue')

    expect(await screen.findByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('group and category created by the admin appear without changing the app', async () => {
    server.use(
      http.get(route('/groups'), () =>
        HttpResponse.json([
          ...groups,
          { key: 'clima', label: 'Clima', type: 'incident', color: 'blue', sortOrder: 6 },
        ]),
      ),
      http.get(route('/categories'), () =>
        HttpResponse.json([
          ...categories,
          { id: 9, name: 'Rua inundada', group: 'clima', type: 'incident', icon: 'ico_a' },
        ]),
      ),
      http.get('https://api.iconify.design/material-symbols.json', () =>
        HttpResponse.json({
          width: 24,
          icons: { 'ico-a-rounded': { body: '<path d="M1 1h4v4z"/>' } },
        }),
      ),
    )
    openAt('/registrar/categoria?type=incident')

    const weather = await screen.findByRole('region', { name: 'Clima' })
    expect(within(weather).getByRole('button', { name: 'Rua inundada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clima' })).toBeInTheDocument()
    await waitFor(() => expect(weather.querySelector('svg path')).toHaveAttribute('d', 'M1 1h4v4z'))
  })

  it('failure loading the categories offers to try again', async () => {
    server.use(http.get(route('/categories'), () => new HttpResponse(null, { status: 500 })))
    openAt('/registrar/categoria?type=issue')

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('category whose group disappeared shows under "Outras" and stays selectable', async () => {
    server.use(
      http.get(route('/categories'), () =>
        HttpResponse.json([
          ...categories,
          { id: 9, name: 'Sem grupo', group: 'removido', type: 'issue', icon: 'ico_a' },
        ]),
      ),
    )
    const user = userEvent.setup()
    openAt('/registrar/categoria?type=issue')

    const others = await screen.findByRole('region', { name: 'Outras' })
    await user.click(within(others).getByRole('button', { name: 'Sem grupo' }))
    expect(screen.getByText('Selecionada: Sem grupo')).toBeInTheDocument()
  })

  it('failure on /grupos offers to try again instead of an empty list', async () => {
    server.use(http.get(route('/groups'), () => new HttpResponse(null, { status: 500 })))
    openAt('/registrar/categoria?type=issue')

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()
    expect(screen.queryByText(/Nenhuma categoria com esse nome/)).not.toBeInTheDocument()
  })

  it("location step with a category of another type goes back to the right type's list", async () => {
    useDraftStore.getState().chooseCategory(7)
    const { router } = openAt('/registrar/local')

    await waitFor(() =>
      expect(router.state.location.pathname + router.state.location.search).toBe(
        '/registrar/categoria?type=issue',
      ),
    )
  })

  it('location step with a category that was deactivated goes back to the list', async () => {
    useDraftStore.getState().chooseCategory(99)
    const { router } = openAt('/registrar/incidente/local')

    await waitFor(() =>
      expect(router.state.location.pathname + router.state.location.search).toBe(
        '/registrar/categoria?type=incident',
      ),
    )
  })
})
