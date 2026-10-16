import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rotas } from '@/app/router'
import { useSessaoStore } from '@/features/auth'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

const ATIVA = problemasNaArea[0]!.id

function abrir(caminho: string) {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

const cartaoExistencia = () =>
  screen.getByRole('heading', { name: 'Confirmações de existência' }).closest('section')!

async function entrarComo(usuario: ReturnType<typeof userEvent.setup>, email: string) {
  await usuario.type(await screen.findByLabelText('E-mail'), email)
  await usuario.type(screen.getByLabelText('Senha'), 'tcc12345')
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('guarda "visitante vê, conta age"', () => {
  afterEach(() => {
    sair()
    sessionStorage.clear()
  })

  it('aceite da etapa 3: visitante vota → login → volta ao detalhe com o voto aplicado', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir(`/mapa/problema/${ATIVA}?modo=ambos`)

    await usuario.click(await screen.findByRole('button', { name: 'Confirmar que existe' }))
    await usuario.click(await screen.findByRole('button', { name: 'Já tenho conta' }))
    expect(router.state.location.pathname).toBe('/login')

    await entrarComo(usuario, 'cidadao1@tcc.local')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar que existe' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    )
    expect(router.state.location.pathname).toBe(`/mapa/problema/${ATIVA}`)
    expect(router.state.location.search).toBe('?modo=ambos')
    expect(within(cartaoExistencia()).getByText('16')).toBeInTheDocument()
  })

  it('"Agora não" esquece o voto: um login depois não vota sozinho', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir(`/mapa/problema/${ATIVA}`)

    await usuario.click(await screen.findByRole('button', { name: 'Confirmar que existe' }))
    await usuario.click(await screen.findByRole('button', { name: 'Agora não' }))
    expect(JSON.parse(sessionStorage.getItem('ocorrencias.pendencia')!).state.pendencia).toBeNull()
    await router.navigate('/login', { state: { de: `/mapa/problema/${ATIVA}` } })
    await entrarComo(usuario, 'cidadao1@tcc.local')

    expect(await screen.findByRole('button', { name: 'Confirmar que existe' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(cartaoExistencia()).getByText('15')).toBeInTheDocument()
  })

  it('visitante em "Registrar" → cadastro → cai no fluxo de registro', async () => {
    const usuario = userEvent.setup()
    const { router } = abrir('/mapa')

    await usuario.click(await screen.findByRole('link', { name: /Registrar/ }))
    expect(await screen.findByRole('heading', { name: 'Entre para registrar' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    await usuario.type(await screen.findByLabelText('Nome'), 'Nova Pessoa')
    await usuario.type(screen.getByLabelText('E-mail'), 'nova@pessoa.com')
    await usuario.type(screen.getByLabelText('Senha'), '12345678')
    await usuario.click(screen.getByRole('checkbox'))
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('heading', { name: 'Nova ocorrência' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/registrar')
    expect(useSessaoStore.getState().sessao?.usuario.nome).toBe('Nova Pessoa')
  })

  it('token expirado (401) limpa a sessão e reabre a guarda com o voto guardado (regra 13)', async () => {
    entrarComoCidadao()
    server.use(
      http.put(
        rota('/problemas/:id/votos/existencia'),
        () => new HttpResponse(null, { status: 401 }),
      ),
    )
    const usuario = userEvent.setup()
    abrir(`/mapa/problema/${ATIVA}`)

    await usuario.click(await screen.findByRole('button', { name: 'Confirmar que existe' }))

    expect(await screen.findByRole('heading', { name: 'Entre para votar' })).toBeInTheDocument()
    expect(
      screen.getByText('Sua sessão expirou. Entre de novo para continuar.'),
    ).toBeInTheDocument()
    expect(useSessaoStore.getState().sessao).toBeNull()
    expect(
      JSON.parse(sessionStorage.getItem('ocorrencias.pendencia')!).state.pendencia.acao,
    ).toEqual({
      tipo: 'votarExistencia',
      problemaId: ATIVA,
      valor: 'confirma',
    })
  })
})
