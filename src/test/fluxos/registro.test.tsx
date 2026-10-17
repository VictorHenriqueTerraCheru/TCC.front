import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rotas } from '@/app/router'
import { useRascunhoStore } from '@/features/registro/stores/rascunho-store'
import { erroDeRegra } from '@/infrastructure/mocks/handlers/comum'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

// O mapa do jsdom não tem tamanho nem GPS: o centro fica em Botafogo (-22.9519, -43.1866),
// exatamente onde a fixture tem um "Buraco na via" — o caso da duplicata.
function abrir(caminho = '/registrar') {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

type Usuario = ReturnType<typeof userEvent.setup>

async function escolher(usuario: Usuario, categoria: string) {
  await usuario.click(await screen.findByRole('button', { name: categoria }))
  await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
}

async function confirmarLocal(usuario: Usuario) {
  // Espera o endereço (consulta com debounce de 600 ms) antes de confirmar.
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
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoriaId,
    ).toBeNull()
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

  it('aceite: recarregar no meio do fluxo não perde o rascunho', async () => {
    sessionStorage.setItem(
      'ocorrencias.rascunhoRegistro',
      JSON.stringify({
        state: {
          categoriaId: 3,
          local: { lat: -22.9535, lng: -43.1827 },
          descricao: 'Poste piscando a noite toda',
          horario: { modo: 'agora', outroEm: null },
        },
        version: 0,
      }),
    )
    // Recarregar = o store nasce lendo o sessionStorage.
    await useRascunhoStore.persist.rehydrate()
    abrir('/registrar/revisao')

    expect(await screen.findByDisplayValue('Poste piscando a noite toda')).toBeInTheDocument()
    expect(await screen.findByText('Poste apagado')).toBeInTheDocument()
  })

  it('falha de rede mostra "Não foi possível enviar"; "Tentar novamente" envia com os mesmos dados', async () => {
    server.use(http.post(rota('/problemas'), () => HttpResponse.error()))
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Fio caído')
    await confirmarLocal(usuario)
    await usuario.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(
      await screen.findByRole('dialog', { name: 'Não foi possível enviar' }),
    ).toBeInTheDocument()
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro')!).state.categoriaId,
    ).toBe(4)

    server.resetHandlers()
    await usuario.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Registro enviado' })).toBeInTheDocument()
  })

  it('incidente: área, "Outro horário" com stepper, revisão anônima e resumo da área', async () => {
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Roubo')
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
      http.post(rota('/incidentes'), () =>
        erroDeRegra(422, 'horario-fora-da-janela', 'Horário fora da janela.'),
      ),
    )
    const usuario = userEvent.setup()
    abrir()

    await escolher(usuario, 'Acidente de trânsito')
    await usuario.click(await screen.findByRole('button', { name: 'Continuar' }))
    await usuario.click(await screen.findByRole('button', { name: /Enviar registro/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O horário precisa estar dentro das últimas 24 horas.',
    )
  })
})
