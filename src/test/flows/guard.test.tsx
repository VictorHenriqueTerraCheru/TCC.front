import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { routes } from '@/app/router'
import { useSessionStore } from '@/features/auth'
import { issuesInArea } from '@/infrastructure/mocks/fixtures/issues'
import { route } from '@/infrastructure/mocks/route'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/session'

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

  it('guest votes → login → back to the same detail, without voting by itself', async () => {
    const votes: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'PUT') votes.push(request.url)
    })
    const user = userEvent.setup()
    const { router } = openAt(`/map/issue/${ACTIVE}?mode=both`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await user.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    expect(router.state.location.pathname).toBe('/login')

    await loginAs(user, 'cidadao1@tcc.local')

    expect(await screen.findByRole('button', { name: 'Sim, está lá' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(router.state.location.pathname).toBe(`/map/issue/${ACTIVE}`)
    expect(router.state.location.search).toBe('?mode=both')
    expect(votes).toEqual([])
    server.events.removeAllListeners()
  })

  it('expired session (expiresAt in the past) counts as guest in the guard', async () => {
    loginAsCitizen()
    const { session } = useSessionStore.getState()
    useSessionStore.setState({ session: { ...session!, expiresAt: '2020-01-01T00:00:00Z' } })
    const user = userEvent.setup()
    const { router } = openAt('/map')

    await user.click(await screen.findByRole('link', { name: /Registrar/ }))

    expect(await screen.findByRole('heading', { name: 'Entre para registrar' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/map')
    expect(useSessionStore.getState().session).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Agora não' }))
  })

  it('guest on "Registrar" → sign up → lands in the report flow', async () => {
    const user = userEvent.setup()
    const { router } = openAt('/map')

    await user.click(await screen.findByRole('link', { name: /Registrar/ }))
    expect(await screen.findByRole('heading', { name: 'Entre para registrar' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    await user.type(await screen.findByLabelText('Nome'), 'Nova Pessoa')
    await user.type(screen.getByLabelText('E-mail'), 'nova@pessoa.com')
    await user.type(screen.getByLabelText('Senha'), '12345678')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('heading', { name: 'Nova ocorrência' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/report')
    expect(useSessionStore.getState().session?.user.name).toBe('Nova Pessoa')
  })

  it('expired token (401) clears the session and reopens the guard', async () => {
    loginAsCitizen()
    let detailCalls = 0
    server.use(
      http.put(route('/issues/:id/vote'), () => new HttpResponse(null, { status: 401 })),
      http.get(route('/issues/:id'), async () => {
        detailCalls += 1
        if (detailCalls > 1) await delay('infinite')
      }),
    )
    const user = userEvent.setup()
    openAt(`/map/issue/${ACTIVE}`)

    await user.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(
      screen.getByText('Sua sessão expirou. Entre de novo para continuar.'),
    ).toBeInTheDocument()
    expect(useSessionStore.getState().session).toBeNull()
  })
})
