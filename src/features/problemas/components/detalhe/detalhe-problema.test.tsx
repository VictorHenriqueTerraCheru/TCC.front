import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { EntreParaContinuar } from '@/features/auth'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'
import { criarDetalhes, ID_DO_AUTOR } from '@/infrastructure/mocks/fixtures/detalhes'
import { erroDeRegra } from '@/infrastructure/mocks/handlers/comum'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

import { DetalheProblema } from './detalhe-problema'

const ATIVA = problemasNaArea[0]!.id
const POSSIVELMENTE = problemasNaArea[4]!.id
const NOVA = problemasNaArea[10]!.id

function renderizar(id: string) {
  definirLargura(390)
  return renderizarRotas([
    {
      path: '/',
      element: (
        <>
          <DetalheProblema id={id} />
          <EntreParaContinuar />
        </>
      ),
    },
  ])
}

function espiarVotos() {
  const votos: string[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method !== 'PUT' || !new URL(request.url).pathname.endsWith('/vote')) return
    const posicao = votos.push('?') - 1
    void request
      .clone()
      .json()
      .then(({ value: valor }: { value: string }) => (votos[posicao] = valor))
  })
  return votos
}

const cartao = () => screen.getByRole('heading', { name: /Ainda está lá\?/ }).closest('section')!

describe('DetalheProblema', () => {
  afterEach(() => {
    sair()
    server.events.removeAllListeners()
  })

  it('Ativa: confiança e a pergunta única "Ainda está lá?" (tela 3)', async () => {
    renderizar(ATIVA)

    expect(await screen.findByRole('heading', { name: 'Buraco na via' })).toBeInTheDocument()
    expect(await screen.findByText('Via pública')).toBeInTheDocument()
    expect(screen.getByText('Confiança alta')).toBeInTheDocument()
    expect(screen.getByText('82 / 100')).toBeInTheDocument()
    expect(screen.getByText(/Calculada com 16 votos/)).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(within(cartao()).getByText('15')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sim, está lá' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Confirmações de existência' }),
    ).not.toBeInTheDocument()
  })

  it('Nova: em avaliação com barra segmentada e a mesma pergunta (tela 22)', async () => {
    renderizar(NOVA)

    expect(await screen.findByRole('heading', { name: 'Fio caído' })).toBeInTheDocument()
    expect(screen.getByText('2 de 5 votos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ainda está lá\?/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeInTheDocument()
    expect(screen.queryByText('Confiança alta')).not.toBeInTheDocument()
  })

  it('Possivelmente resolvida: "Ainda está lá?" em destaque (tela 23)', async () => {
    renderizar(POSSIVELMENTE)

    expect(await screen.findByRole('heading', { name: 'Ainda está lá?' })).toBeInTheDocument()
    expect(
      screen.getByText(/7 pessoas disseram que não está mais lá nas últimas 24 h/),
    ).toBeInTheDocument()
    expect(screen.getByText('Possivelmente resolvida')).toBeInTheDocument()
    expect(screen.getByText('Confiança média')).toBeInTheDocument()
    expect(screen.getByText('58 / 100')).toBeInTheDocument()
  })

  it('Resolvida (link salvo): só leitura, sem botões de voto', async () => {
    const detalhe = criarDetalhes().get(ATIVA)!
    server.use(
      http.get(rota('/issues/:id'), () =>
        HttpResponse.json({ ...detalhe, status: 'resolved', trustScore: null, band: null }),
      ),
    )
    renderizar(ATIVA)

    expect(await screen.findByText(/confirmou que este problema foi resolvido/)).toBeInTheDocument()
    expect(screen.getByText('Resolvida')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sim, está lá' })).not.toBeInTheDocument()
  })

  it('enquanto um voto está em andamento, os outros botões ficam desabilitados', async () => {
    entrarComoCidadao()
    server.use(
      http.put(rota('/issues/:id/vote'), async () => {
        await delay('infinite')
      }),
    )
    renderizar(ATIVA)

    await userEvent.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    expect(screen.getByRole('button', { name: 'Não está lá' })).toBeDisabled()
  })

  it('aberto (folha expandida ou desktop), só o cartão completo pergunta "Ainda está lá?"', async () => {
    entrarComoCidadao()
    renderizar(ATIVA)

    expect(await screen.findByRole('button', { name: 'Sim, está lá' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('souAutor: sem botões de voto, com a dica no cartão', async () => {
    entrarComoCidadao()
    renderizar(ID_DO_AUTOR)

    expect(await screen.findByText('Você registrou este problema')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sim, está lá' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('logado, o voto vai num PUT só, atualiza na hora e fica marcado', async () => {
    entrarComoCidadao()
    const votos = espiarVotos()
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(screen.getByRole('button', { name: 'Sim, está lá' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(cartao()).getByText('16')).toBeInTheDocument()
    await waitFor(() => expect(votos).toEqual(['yes']))
    expect(screen.getByText(/Calculada com 17 votos/)).toBeInTheDocument()
  })

  it('trocar a resposta substitui o voto', async () => {
    entrarComoCidadao()
    const votos = espiarVotos()
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Sim, está lá' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Não está lá' })).toBeEnabled())
    await usuario.click(screen.getByRole('button', { name: 'Não está lá' }))

    await waitFor(() => expect(votos).toEqual(['yes', 'no']))
    expect(screen.getByRole('button', { name: 'Não está lá' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(cartao()).getByText('2')).toBeInTheDocument()
  })

  it('erro de regra desfaz o voto otimista e mostra a mensagem', async () => {
    entrarComoCidadao()
    server.use(
      http.put(rota('/issues/:id/vote'), () =>
        erroDeRegra(422, 'issue-resolved', 'Problema resolvido.'),
      ),
    )
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Não está lá' }))

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Este problema já foi resolvido.')
    expect(screen.getByRole('button', { name: 'Não está lá' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(cartao()).getByText('1')).toBeInTheDocument()
  })

  it('visitante que tenta votar vê "Entre para votar" (tela 27)', async () => {
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Já tenho conta' })).toBeInTheDocument()
  })
})
