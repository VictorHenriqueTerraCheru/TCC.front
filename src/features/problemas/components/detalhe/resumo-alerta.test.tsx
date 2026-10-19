import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PainelResponsivo } from '@/common/components/painel-responsivo'
import { ContextoPainel } from '@/common/hooks/use-painel-responsivo'
import { EntreParaContinuar } from '@/features/auth'
import { criarDetalhes } from '@/infrastructure/mocks/fixtures/detalhes'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

import type { DetalheProblema } from '../../models/problema'
import { ALTURA_RESUMO, ResumoAlerta } from './resumo-alerta'

const ATIVA = criarDetalhes().get(problemasNaArea[0]!.id)!
const NOVA = criarDetalhes().get(problemasNaArea[10]!.id)!

/** Por padrão, na folha recolhida do celular: é só nela que o card tem os polegares. */
function renderizar(problema: DetalheProblema, { recolhido = true } = {}) {
  definirLargura(390)
  return renderizarRotas([
    {
      path: '/',
      element: (
        <ContextoPainel.Provider value={{ recolhido, expandir: () => {}, medirResumo: () => {} }}>
          <ResumoAlerta problema={problema} />
          <EntreParaContinuar />
        </ContextoPainel.Provider>
      ),
    },
  ])
}

function espiarVotos() {
  const votos: unknown[] = []
  server.use(
    http.put(rota('/problemas/:id/voto'), async ({ request }) => {
      votos.push(await request.json())
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return votos
}

describe('ResumoAlerta', () => {
  afterEach(sair)

  it('mostra categoria, endereço e confirmações', () => {
    renderizar(ATIVA)

    expect(screen.getByRole('heading', { name: ATIVA.categoria.nome })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(ATIVA.endereco))).toBeInTheDocument()
    expect(screen.getByText(`${ATIVA.votos.sim} confirmaram`)).toBeInTheDocument()
  })

  it.each([
    ['nova', NOVA],
    ['ativa', ATIVA],
  ])('%s: "Ainda está lá?" com um voto só', async (_status, problema) => {
    entrarComoCidadao()
    const votos = espiarVotos()
    renderizar(problema)

    expect(screen.getByText('Ainda está lá?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Não está lá' }))

    expect(votos).toEqual([expect.objectContaining({ valor: 'nao' })])
  })

  it('aberto (folha expandida ou desktop), sem polegares: o cartão completo já pergunta', () => {
    entrarComoCidadao()
    renderizar(ATIVA, { recolhido: false })

    expect(screen.queryByText('Ainda está lá?')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('autor não vê os polegares', () => {
    renderizar({ ...ATIVA, souAutor: true })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('resolvida não tem botões', () => {
    renderizar({ ...ATIVA, status: 'resolvida' })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('visitante tocando no polegar abre "Entre para votar"', async () => {
    renderizar(ATIVA)

    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, está lá' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
  })

  it('no celular, tocar no card expande a folha; os polegares votam sem expandir', async () => {
    entrarComoCidadao()
    espiarVotos()
    definirLargura(390)
    renderizarRotas([
      {
        path: '/',
        element: (
          <PainelResponsivo titulo="Detalhe" aoFechar={() => {}} alturaResumo={ALTURA_RESUMO}>
            <ResumoAlerta problema={ATIVA} />
          </PainelResponsivo>
        ),
      },
    ])
    const estagio = () =>
      screen.getByRole('heading', { name: ATIVA.categoria.nome }).closest('[data-estagio]')

    expect(estagio()).toHaveAttribute('data-estagio', 'resumo')
    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, está lá' }))
    expect(estagio()).toHaveAttribute('data-estagio', 'resumo')

    await userEvent.click(screen.getByRole('heading', { name: ATIVA.categoria.nome }))
    expect(estagio()).toHaveAttribute('data-estagio', 'aberto')
    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })
})
