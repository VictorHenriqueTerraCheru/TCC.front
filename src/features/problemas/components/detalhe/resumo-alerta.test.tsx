import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { PainelResponsivo } from '@/common/components/painel-responsivo'
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

function renderizar(problema: DetalheProblema) {
  definirLargura(390)
  return renderizarRotas([
    {
      path: '/',
      element: (
        <>
          <ResumoAlerta problema={problema} />
          <EntreParaContinuar />
        </>
      ),
    },
  ])
}

function espiarVotos() {
  const votos: { tipo: string; corpo: unknown }[] = []
  for (const tipo of ['existencia', 'persistencia']) {
    server.use(
      http.put(rota(`/problemas/:id/votos/${tipo}`), async ({ request }) => {
        votos.push({ tipo, corpo: await request.json() })
        return new HttpResponse(null, { status: 204 })
      }),
    )
  }
  return votos
}

describe('ResumoAlerta', () => {
  afterEach(sair)

  it('mostra categoria, endereço e confirmações', () => {
    renderizar(ATIVA)

    expect(screen.getByRole('heading', { name: ATIVA.categoria.nome })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(ATIVA.endereco))).toBeInTheDocument()
    expect(screen.getByText(`${ATIVA.existencia.confirmacoes} confirmaram`)).toBeInTheDocument()
  })

  it('nova: polegares votam existência', async () => {
    entrarComoCidadao()
    const votos = espiarVotos()
    renderizar(NOVA)

    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Confirmar que existe' }))

    expect(votos).toEqual([
      { tipo: 'existencia', corpo: expect.objectContaining({ valor: 'confirma' }) },
    ])
    expect(screen.getByRole('button', { name: 'Voto rápido: Não vi' })).toBeInTheDocument()
  })

  it('ativa: polegares votam persistência', async () => {
    entrarComoCidadao()
    const votos = espiarVotos()
    renderizar(ATIVA)

    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, continua' }))

    expect(votos).toEqual([
      { tipo: 'persistencia', corpo: expect.objectContaining({ valor: 'continua' }) },
    ])
    expect(
      screen.getByRole('button', { name: 'Voto rápido: Não, foi resolvido' }),
    ).toBeInTheDocument()
  })

  it('autor não vê os botões de existência em nova', () => {
    renderizar({ ...NOVA, souAutor: true })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('resolvida não tem botões', () => {
    renderizar({ ...ATIVA, status: 'resolvida' })

    expect(screen.queryByRole('button', { name: /^Voto rápido/ })).not.toBeInTheDocument()
  })

  it('visitante tocando no polegar abre "Entre para votar"', async () => {
    renderizar(ATIVA)

    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, continua' }))

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
    await userEvent.click(screen.getByRole('button', { name: 'Voto rápido: Sim, continua' }))
    expect(estagio()).toHaveAttribute('data-estagio', 'resumo')

    await userEvent.click(screen.getByRole('heading', { name: ATIVA.categoria.nome }))
    expect(estagio()).toHaveAttribute('data-estagio', 'aberto')
  })
})
