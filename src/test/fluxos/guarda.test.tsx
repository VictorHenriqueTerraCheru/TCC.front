import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { routes } from '@/app/router'
import { useSessionStore } from '@/features/auth'
import { issuesInArea } from '@/infrastructure/mocks/fixtures/problemas'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/sessao'

const ACTIVE = issuesInArea[0]!.id

function openAt(path: string) {
  setWidth(390)
  return renderRoutes(routes, path)
}

async function loginAs(user: ReturnType<typeof userEvent.setup>, email: string) {
  await user.type(await screen.findByLabelText('E-mail'), email)
  await user.type(screen.getByLabelText('Senha'), 'tcc12345')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('guard "guests see, accounts act"', () => {
  afterEach(() => {
    logout()
    sessionStorage.clear()
  })

  it('acceptance of stage 3: guest votes → login → back to the detail with the vote applied', async () => {
    const user = userEvent.setup()
    const { router } = openAt(`/mapa/problema/${ACTIVE}?mode=both`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await user.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    expect(router.state.location.pathname).toBe('/login')

    await loginAs(user, 'cidadao1@tcc.local')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sim, está lá' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    )
    expect(router.state.location.pathname).toBe(`/mapa/problema/${ACTIVE}`)
    expect(router.state.location.search).toBe('?mode=both')
    expect(screen.getByText(/Calculada com 17 votos/)).toBeInTheDocument()
  })

  it('quick card: guest taps the thumb → login → the vote is resumed (rule 1)', async () => {
    const user = userEvent.setup()
    const { router } = openAt(`/mapa/problema/${ACTIVE}`)

    await user.click(await screen.findByRole('button', { name: 'Voto rápido: Sim, está lá' }))
    await user.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    await loginAs(user, 'cidadao1@tcc.local')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Voto rápido: Sim, está lá' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    )
    expect(router.state.location.pathname).toBe(`/mapa/problema/${ACTIVE}`)
  })

  it('"Agora não" forgets the vote: a later login does not vote by itself', async () => {
    const user = userEvent.setup()
    const { router } = openAt(`/mapa/problema/${ACTIVE}`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await user.click(await screen.findByRole('button', { name: 'Agora não' }))
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.pendencia')!).state.pendingAction,
    ).toBeNull()
    await router.navigate('/login', { state: { de: `/mapa/problema/${ACTIVE}` } })
    await loginAs(user, 'cidadao1@tcc.local')

    expect(await screen.findByRole('button', { name: 'Sim, está lá' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByText(/Calculada com 16 votos/)).toBeInTheDocument()
  })

  it('browser "back" on login also forgets the vote', async () => {
    const user = userEvent.setup()
    const { router } = openAt(`/mapa/problema/${ACTIVE}`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await user.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    expect(router.state.location.pathname).toBe('/login')
    await router.navigate(-1)

    await waitFor(() =>
      expect(
        JSON.parse(sessionStorage.getItem('ocorrencias.pendencia')!).state.pendingAction,
      ).toBeNull(),
    )
  })

  it('expired session (expiresAt in the past) counts as guest in the guard', async () => {
    loginAsCitizen()
    const { session } = useSessionStore.getState()
    useSessionStore.setState({ session: { ...session!, expiresAt: '2020-01-01T00:00:00Z' } })
    const user = userEvent.setup()
    const { router } = openAt('/mapa')

    await user.click(await screen.findByRole('link', { name: /Registrar/ }))

    expect(await screen.findByRole('heading', { name: 'Entre para registrar' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mapa')
    expect(useSessionStore.getState().session).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Agora não' }))
  })

  it('guest on "Registrar" → sign up → lands in the report flow', async () => {
    const user = userEvent.setup()
    const { router } = openAt('/mapa')

    await user.click(await screen.findByRole('link', { name: /Registrar/ }))
    expect(await screen.findByRole('heading', { name: 'Entre para registrar' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await user.type(await screen.findByLabelText('Nome'), 'Nova Pessoa')
    await user.type(screen.getByLabelText('E-mail'), 'nova@pessoa.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('heading', { name: 'Nova ocorrência' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar')
    expect(useSessionStore.getState().session?.user.name).toBe('Nova Pessoa')
  })

  it('expired token (401) clears the session and reopens the guard with the stored vote (rule 13)', async () => {
    loginAsCitizen()
    server.use(http.put(route('/issues/:id/vote'), () => new HttpResponse(null, { status: 401 })))
    const user = userEvent.setup()
    openAt(`/mapa/problema/${ACTIVE}`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(
      screen.getByText('Sua sessão expirou. Entre de novo para continuar.'),
    ).toBeInTheDocument()
    expect(useSessionStore.getState().session).toBeNull()
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.pendencia')!).state.pendingAction.action,
    ).toEqual({
      type: 'vote',
      issueId: ACTIVE,
      value: 'yes',
    })
  })
})
