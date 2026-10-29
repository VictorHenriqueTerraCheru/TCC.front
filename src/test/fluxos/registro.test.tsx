import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rotas } from '@/app/router'
import { useRascunhoStore } from '@/features/registro/stores/rascunho-store'
import { banco } from '@/infrastructure/mocks/banco'
import { erroDeRegra } from '@/infrastructure/mocks/handlers/comum'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

function abrir(caminho = '/registrar') {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

type Usuario = ReturnType<typeof userEvent.setup>

async function escolher(usuario: Usuario, categoria: string, tipo: 'issue' | 'incident' = 'issue') {
  await usuario.click(
    await screen.findByRole('link', {
      name: tipo === 'issue' ? /^Estado/ : /^Evento/,
    }),
  )
  await usuario.click(await screen.findByRole('button', { name: categoria }))
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
}

async function confirmarLocal(usuario: Usuario) {
  await screen.findByText('Praia de Botafogo, 300 — Botafogo', {}, { timeout: 2000 })
  await usuario.click(screen.getByRole('button', { name: 'Confirmar local' }))
}

describe('fluxo de registro', () => {
  beforeEach(entrarComoCidadao)
  afterEach(() => {
    sair()
    useRascunhoStore.getState().limpar()
    sessionStorage.clear()
  })

  it('visitante que abre /registrar vai para o login', async () => {
    sair()
    const { router } = abrir()
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('visitante em /registrar/categoria?tipo=incident volta para a mesma URL depois do login', async () => {
    sair()
    const { router } = abrir('/registrar/categoria?tipo=incident')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    expect(router.state.location.state).toEqual({ de: '/registrar/categoria?tipo=incident' })
  })

  it('aceite: registrar onde já há um buraco a menos de 50 m abre a conferência; "Não, é outro" segue e envia', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir()

    await escolher(usuario, 'Buraco na via')
    expect(await screen.findByRole('heading', { name: 'Onde fica?' })).toBeInTheDocument()
    await confirmarLocal(usuario)

    expect(
      await screen.findByRole('heading', {
        name: /Já existe um registro de Buraco na via a .* É o mesmo\?/,
      }),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Não, é outro' }))

    await usuario.type(await screen.findByLabelText('Descrição (opcional)'), 'Buraco fundo')
    expect(screen.getByText('12/280')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar/sucesso')
    await waitFor(() =>
      expect(
        JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoryId,
      ).toBeNull(),
    )
  })

  it('sessão expirada no envio (401): login e o registro é enviado ao voltar', async () => {
    server.use(
      http.post(rota('/issues'), () => new HttpResponse(null, { status: 401 }), {
        once: true,
      }),
    )
    const usuario = userEvent.setup()
    const { router } = abrir()

    await escolher(usuario, 'Buraco na via')
    await confirmarLocal(usuario)
    await usuario.click(await screen.findByRole('button', { name: 'Não, é outro' }))
    await usuario.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await usuario.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    await usuario.type(await screen.findByLabelText('E-mail'), 'cidadao1@tcc.local')
    await usuario.type(screen.getByLabelText('Senha'), 'tcc12345')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar/sucesso')
  })

  it('"Sim, confirmar esse" vota no existente e mostra a confirmação', async () => {
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Buraco na via')
    await confirmarLocal(usuario)
    await usuario.click(await screen.findByRole('button', { name: 'Sim, confirmar esse' }))

    expect(
      await screen.findByRole('heading', { name: 'Confirmação registrada' }),
    ).toBeInTheDocument()
  })

  it('revisão com categoria desativada volta para a escolha da categoria', async () => {
    sessionStorage.setItem(
      'ocorrencias.rascunhoRegistro',
      JSON.stringify({
        state: {
          categoryId: 3,
          local: { lat: -22.9535, lng: -43.1827 },
          description: '',
          horario: { modo: 'agora', outroEm: null },
        },
        version: 0,
      }),
    )
    await useRascunhoStore.persist.rehydrate()
    banco.alterarAtivaCategoria(3, false)
    const { router } = abrir('/registrar/revisao')

    await waitFor(() => expect(router.state.location.pathname).toBe('/registrar/categoria'))
  })

  it('aceite: recarregar no meio do fluxo não perde o rascunho', async () => {
    sessionStorage.setItem(
      'ocorrencias.rascunhoRegistro',
      JSON.stringify({
        state: {
          categoryId: 3,
          local: { lat: -22.9535, lng: -43.1827 },
          description: 'Poste piscando a noite toda',
          horario: { modo: 'agora', outroEm: null },
        },
        version: 0,
      }),
    )
    await useRascunhoStore.persist.rehydrate()
    abrir('/registrar/revisao')

    expect(await screen.findByDisplayValue('Poste piscando a noite toda')).toBeInTheDocument()
    expect(await screen.findByText('Poste apagado')).toBeInTheDocument()
  })

  it('falha de rede mostra "Não foi possível enviar"; "Tentar novamente" envia com os mesmos dados', async () => {
    server.use(http.post(rota('/issues'), () => HttpResponse.error()))
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Fio caído')
    await confirmarLocal(usuario)
    await usuario.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(
      await screen.findByRole('dialog', { name: 'Não foi possível enviar' }),
    ).toBeInTheDocument()
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoryId,
    ).toBe(4)

    server.resetHandlers()
    await usuario.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
  })

  it('incidente: área, "Outro horário" com stepper, revisão anônima e resumo da área', async () => {
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Roubo', 'incident')
    expect(await screen.findByRole('heading', { name: 'Onde aconteceu?' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('radio', { name: 'Outro horário' }))
    await usuario.click(screen.getByRole('button', { name: '15 minutos antes' }))
    expect(screen.getByRole('button', { name: '15 minutos depois' })).toBeEnabled()
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByText('Registro anônimo e agregado')).toBeInTheDocument()
    expect(screen.getByText(/por volta das/)).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('heading', { name: 'Relato enviado' })).toBeInTheDocument()
    expect(screen.getByText(/Roubos · \d+ relatos nos últimos 7 dias/)).toBeInTheDocument()
  })

  it('incidente recusado por horário mostra a mensagem do type', async () => {
    server.use(
      http.post(rota('/incidents'), () =>
        erroDeRegra(422, 'time-outside-window', 'Horário fora da janela.'),
      ),
    )
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Acidente de trânsito', 'incident')
    await usuario.click(await screen.findByRole('button', { name: 'Continuar' }))
    await usuario.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O horário precisa estar dentro das últimas 24 horas.',
    )
  })
})
