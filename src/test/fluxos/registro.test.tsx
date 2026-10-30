import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { routes } from '@/app/router'
import { useDraftStore } from '@/features/registro/stores/rascunho-store'
import { database } from '@/infrastructure/mocks/banco'
import { ruleError } from '@/infrastructure/mocks/handlers/comum'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsCitizen, logout } from '@/test/sessao'

function openAt(path = '/registrar') {
  setWidth(390)
  return renderRoutes(routes, path)
}

type User = ReturnType<typeof userEvent.setup>

async function choose(user: User, category: string, type: 'issue' | 'incident' = 'issue') {
  await user.click(
    await screen.findByRole('link', {
      name: type === 'issue' ? /^Estado/ : /^Evento/,
    }),
  )
  await user.click(await screen.findByRole('button', { name: category }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

async function confirmLocation(user: User) {
  await screen.findByText('Praia de Botafogo, 300 — Botafogo', {}, { timeout: 2000 })
  await user.click(screen.getByRole('button', { name: 'Confirmar local' }))
}

describe('report flow', () => {
  beforeEach(loginAsCitizen)
  afterEach(() => {
    logout()
    useDraftStore.getState().clear()
    sessionStorage.clear()
  })

  it('guest who opens /registrar goes to login', async () => {
    logout()
    const { router } = openAt()
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('guest on /registrar/categoria?type=incident returns to the same URL after login', async () => {
    logout()
    const { router } = openAt('/registrar/categoria?type=incident')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.state).toEqual({ de: '/registrar/categoria?type=incident' })
  })

  it('acceptance: reporting where there is already a pothole within 50 m opens the duplicate check; "Não, é outro" continues and submits', async () => {
    const user = userEvent.setup()
    const { router } = openAt()

    await choose(user, 'Buraco na via')
    expect(await screen.findByRole('heading', { name: 'Onde fica?' })).toBeInTheDocument()
    await confirmLocation(user)

    expect(
      await screen.findByRole('heading', {
        name: /Já existe um registro de Buraco na via a .* É o mesmo\?/,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Não, é outro' }))

    await user.type(await screen.findByLabelText('Descrição (opcional)'), 'Buraco fundo')
    expect(screen.getByText('12/280')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar/sucesso')
    await waitFor(() =>
      expect(
        JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoryId,
      ).toBeNull(),
    )
  })

  it('session expired on submit (401): login and the report is submitted on return', async () => {
    server.use(
      http.post(route('/issues'), () => new HttpResponse(null, { status: 401 }), {
        once: true,
      }),
    )
    const user = userEvent.setup()
    const { router } = openAt()

    await choose(user, 'Buraco na via')
    await confirmLocation(user)
    await user.click(await screen.findByRole('button', { name: 'Não, é outro' }))
    await user.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await user.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    await user.type(await screen.findByLabelText('E-mail'), 'cidadao1@tcc.local')
    await user.type(screen.getByLabelText('Senha'), 'tcc12345')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar/sucesso')
  })

  it('"Sim, confirmar esse" votes on the existing one and shows the confirmation', async () => {
    const user = userEvent.setup()
    openAt()

    await choose(user, 'Buraco na via')
    await confirmLocation(user)
    await user.click(await screen.findByRole('button', { name: 'Sim, confirmar esse' }))

    expect(
      await screen.findByRole('heading', { name: 'Confirmação registrada' }),
    ).toBeInTheDocument()
  })

  it('review with a deactivated category goes back to choosing the category', async () => {
    sessionStorage.setItem(
      'ocorrencias.rascunhoRegistro',
      JSON.stringify({
        state: {
          categoryId: 3,
          location: { lat: -22.9535, lng: -43.1827 },
          description: '',
          time: { mode: 'now', otherAt: null },
        },
        version: 0,
      }),
    )
    await useDraftStore.persist.rehydrate()
    database.setCategoryActive(3, false)
    const { router } = openAt('/registrar/revisao')

    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar/categoria'))
  })

  it('acceptance: reloading in the middle of the flow does not lose the draft', async () => {
    sessionStorage.setItem(
      'ocorrencias.rascunhoRegistro',
      JSON.stringify({
        state: {
          categoryId: 3,
          location: { lat: -22.9535, lng: -43.1827 },
          description: 'Poste piscando a noite toda',
          time: { mode: 'now', otherAt: null },
        },
        version: 0,
      }),
    )
    await useDraftStore.persist.rehydrate()
    openAt('/registrar/revisao')

    expect(await screen.findByDisplayValue('Poste piscando a noite toda')).toBeInTheDocument()
    expect(await screen.findByText('Poste apagado')).toBeInTheDocument()
  })

  it('network failure shows "Não foi possível enviar"; "Tentar novamente" submits with the same data', async () => {
    server.use(http.post(route('/issues'), () => HttpResponse.error()))
    const user = userEvent.setup()
    openAt()

    await choose(user, 'Fio caído')
    await confirmLocation(user)
    await user.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(
      await screen.findByRole('dialog', { name: 'Não foi possível enviar' }),
    ).toBeInTheDocument()
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoryId,
    ).toBe(4)

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
  })

  it('incident: area, "Outro horário" with stepper, anonymous review and area summary', async () => {
    const user = userEvent.setup()
    openAt()

    await choose(user, 'Roubo', 'incident')
    expect(await screen.findByRole('heading', { name: 'Onde aconteceu?' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Outro horário' }))
    await user.click(screen.getByRole('button', { name: '15 minutos antes' }))
    expect(screen.getByRole('button', { name: '15 minutos depois' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByText('Registro anônimo e agregado')).toBeInTheDocument()
    expect(screen.getByText(/por volta das/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('heading', { name: 'Relato enviado' })).toBeInTheDocument()
    expect(screen.getByText(/Roubos · \d+ relatos nos últimos 7 dias/)).toBeInTheDocument()
  })

  it('incident rejected because of the time shows the type message', async () => {
    server.use(
      http.post(route('/incidents'), () =>
        ruleError(422, 'time-outside-window', 'Horário fora da janela.'),
      ),
    )
    const user = userEvent.setup()
    openAt()

    await choose(user, 'Acidente de trânsito', 'incident')
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    await user.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O horário precisa estar dentro das últimas 24 horas.',
    )
  })
})
