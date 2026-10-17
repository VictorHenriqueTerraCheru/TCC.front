import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'

import { EntreParaContinuar } from '@/features/auth'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'
import { ID_DO_AUTOR } from '@/infrastructure/mocks/fixtures/detalhes'
import { erroDeRegra } from '@/infrastructure/mocks/handlers/comum'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

import { DetalheProblema } from './detalhe-problema'

const ATIVA = problemasNaArea[0]!.id // Buraco na via · alta · 82
const POSSIVELMENTE = problemasNaArea[4]!.id // Lixo acumulado · média · 58
const NOVA = problemasNaArea[10]!.id // Fio caído · em avaliação

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

const cartao = (titulo: string) => screen.getByRole('heading', { name: titulo }).closest('section')!

describe('DetalheProblema', () => {
  afterEach(sair)

  it('Ativa: confiança, contagens e os dois cartões de voto (tela 3)', async () => {
    renderizar(ATIVA)

    expect(await screen.findByRole('heading', { name: 'Buraco na via' })).toBeInTheDocument()
    expect(screen.getByText('Via pública')).toBeInTheDocument()
    expect(screen.getByText('Confiança alta')).toBeInTheDocument()
    expect(screen.getByText('82 / 100')).toBeInTheDocument()
    expect(screen.getByText(/Calculada com 16 votos/)).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(within(cartao('Confirmações de existência')).getByText('15')).toBeInTheDocument()
    expect(within(cartao('Ainda está lá?')).getByText('9')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar que existe' })).toBeEnabled()
  })

  it('Nova: em avaliação com barra segmentada, sem "Ainda está lá?" (tela 22)', async () => {
    renderizar(NOVA)

    expect(await screen.findByRole('heading', { name: 'Fio caído' })).toBeInTheDocument()
    expect(screen.getByText('2 de 5 votos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Viu este fio?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não vi' })).toBeInTheDocument()
    expect(screen.queryByText('Confiança alta')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ainda está lá?' })).not.toBeInTheDocument()
  })

  it('Possivelmente resolvida: "Ainda está lá?" em destaque (tela 23)', async () => {
    renderizar(POSSIVELMENTE)

    expect(await screen.findByRole('heading', { name: 'Ainda está lá?' })).toBeInTheDocument()
    expect(
      screen.getByText(/7 pessoas disseram que foi resolvido nas últimas 24 h/),
    ).toBeInTheDocument()
    expect(screen.getByText('Possivelmente resolvida')).toBeInTheDocument()
    expect(screen.getByText('Confiança média')).toBeInTheDocument()
    expect(screen.getByText('58 / 100')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar que existe' })).not.toBeInTheDocument()
  })

  it('souAutor: "Confirmar que existe" desabilitado com a dica', async () => {
    entrarComoCidadao()
    renderizar(ID_DO_AUTOR)

    const botao = await screen.findByRole('button', { name: 'Confirmar que existe' })
    expect(botao).toBeDisabled()
    expect(screen.getByText('Você registrou este problema')).toBeInTheDocument()
    // O autor ainda vota persistência.
    expect(screen.getByRole('button', { name: 'Sim, continua' })).toBeEnabled()
  })

  it('logado, o voto atualiza na hora e fica marcado', async () => {
    entrarComoCidadao()
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Sim, continua' }))

    expect(screen.getByRole('button', { name: 'Sim, continua' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(cartao('Ainda está lá?')).getByText('10')).toBeInTheDocument()
  })

  it('erro de regra desfaz o voto otimista e mostra a mensagem', async () => {
    entrarComoCidadao()
    server.use(
      http.put(rota('/problemas/:id/votos/persistencia'), () =>
        erroDeRegra(422, 'problema-resolvido', 'Problema resolvido.'),
      ),
    )
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Não, foi resolvido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este problema já foi resolvido.')
    expect(screen.getByRole('button', { name: 'Não, foi resolvido' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(cartao('Ainda está lá?')).getByText('1')).toBeInTheDocument()
  })

  it('visitante que tenta votar vê "Entre para votar" (tela 27)', async () => {
    const usuario = userEvent.setup()
    renderizar(ATIVA)

    await usuario.click(await screen.findByRole('button', { name: 'Confirmar que existe' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Já tenho conta' })).toBeInTheDocument()
  })
})
