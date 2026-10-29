import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { rotas } from '@/app/router'
import { banco } from '@/infrastructure/mocks/banco'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoAdmin, entrarComoCidadao, sair } from '@/test/sessao'

function abrir(caminho: string) {
  definirLargura(390)
  return renderizarRotas(rotas, caminho)
}

const JUSTIFICATIVA = 'Moro na Rua São Clemente há 8 anos e passo pelo trecho todos os dias.'

describe('perfil, verificação e fila do admin', () => {
  afterEach(sair)

  it('aceite da etapa 5: cidadão solicita → admin aprova → perfil mostra "Perfil verificado"', async () => {
    const usuario = userEvent.setup()

    // 1. Cidadã pede a verificação.
    entrarComoCidadao()
    const cidada = abrir('/perfil')
    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeInTheDocument()
    expect(screen.getByText('Cidadão')).toBeInTheDocument()
    await usuario.click(screen.getByRole('link', { name: 'Solicitar verificação' }))
    await usuario.type(await screen.findByLabelText('Justificativa *'), JUSTIFICATIVA)
    await usuario.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByText('Pedido em análise')).toBeInTheDocument()
    cidada.unmount()

    // 2. Admin aprova na fila.
    sair()
    entrarComoAdmin()
    const admin = abrir('/admin/verificacoes')
    const pedido = await screen.findByRole('article', { name: 'Pedido de Ana Lima' })
    expect(screen.getByRole('tab', { name: 'Pendentes · 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await usuario.click(within(pedido).getByRole('button', { name: 'Aprovar' }))
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Pedido de Ana Lima' })).not.toBeInTheDocument(),
    )
    admin.unmount()

    // 3. O perfil da cidadã (GET /me, não a claim do token) mostra a verificação.
    sair()
    entrarComoCidadao()
    abrir('/perfil')
    expect(await screen.findByText('Perfil verificado')).toBeInTheDocument()
    expect(screen.getByText('Seu voto tem peso maior')).toBeInTheDocument()
  })

  it('recusa exige motivo e a pessoa vê o banner "Recusada" ao pedir de novo', async () => {
    const usuario = userEvent.setup()

    entrarComoCidadao()
    const cidada = abrir('/perfil/verificacao')
    await usuario.type(await screen.findByLabelText('Justificativa *'), JUSTIFICATIVA)
    await usuario.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    await screen.findByText('Pedido em análise')
    cidada.unmount()

    sair()
    entrarComoAdmin()
    const admin = abrir('/admin/verificacoes')
    const pedido = await screen.findByRole('article', { name: 'Pedido de Ana Lima' })
    await usuario.click(within(pedido).getByRole('button', { name: 'Recusar' }))
    const confirmar = within(pedido).getByRole('button', { name: 'Confirmar recusa' })
    expect(confirmar).toBeDisabled()
    await usuario.type(
      within(pedido).getByLabelText('Motivo da recusa *'),
      'Sem vínculo com a região.',
    )
    await usuario.click(confirmar)
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Pedido de Ana Lima' })).not.toBeInTheDocument(),
    )
    admin.unmount()

    sair()
    entrarComoCidadao()
    abrir('/perfil/verificacao')
    expect(await screen.findByText('Recusada')).toBeInTheDocument()
    expect(screen.getByText('Motivo: Sem vínculo com a região.')).toBeInTheDocument()
  })

  it('justificativa curta mostra o erro do protótipo', async () => {
    const usuario = userEvent.setup()
    entrarComoCidadao()
    abrir('/perfil/verificacao')

    await usuario.type(await screen.findByLabelText('Justificativa *'), 'curta')
    await usuario.click(screen.getByRole('button', { name: 'Enviar pedido' }))

    expect(
      await screen.findByText('Campo obrigatório — escreva pelo menos 30 caracteres.'),
    ).toBeInTheDocument()
  })

  it('cidadão não acessa a fila do admin', async () => {
    entrarComoCidadao()
    abrir('/admin/verificacoes')
    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
  })

  it('admin com /me fora do ar vê "Tentar novamente", não "só para administradores"', async () => {
    entrarComoAdmin()
    server.use(http.get(rota('/me'), () => new HttpResponse(null, { status: 500 })))
    abrir('/admin/verificacoes')

    expect(
      await screen.findByText('Não foi possível confirmar seu perfil.', {}, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Esta área é só para administradores.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('"Cancelar" na edição do nome descarta o texto digitado', async () => {
    entrarComoCidadao()
    const usuario = userEvent.setup()
    abrir('/perfil/configuracoes')

    await usuario.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))
    await usuario.clear(screen.getByLabelText('Nome'))
    await usuario.type(screen.getByLabelText('Nome'), 'Rascunho descartado')
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))
    await usuario.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))

    expect(await screen.findByLabelText('Nome')).toHaveValue('Ana Lima')
  })

  it('histórico agrupa por período e filtra por votos', async () => {
    // A fixture usa horários relativos ("30 min atrás"): perto da meia-noite eles cairiam em
    // "Ontem". Relógio fixo à tarde, só para Date (timers reais, por causa do userEvent).
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 15, 0))
    onTestFinished(() => {
      vi.useRealTimers()
    })
    banco.reiniciar()
    const usuario = userEvent.setup()
    entrarComoCidadao()
    abrir('/perfil/historico')

    expect(await screen.findByRole('heading', { name: 'Hoje' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ontem' })).toBeInTheDocument()
    expect(screen.getByText('Registrou · Roubo (anônimo)')).toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: 'Votos' }))
    await waitFor(() => expect(screen.queryByText(/^Registrou/)).not.toBeInTheDocument())
    expect(screen.getByText('Disse que está lá · Buraco na via')).toBeInTheDocument()
  })

  it('configurações: edita o nome e sai da conta', async () => {
    const usuario = userEvent.setup()
    entrarComoCidadao()
    const { router } = abrir('/perfil/configuracoes')

    await usuario.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))
    const campo = screen.getByLabelText('Nome')
    await usuario.clear(campo)
    await usuario.type(campo, 'Ana L.')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('button', { name: /Nome\s*Ana L\./ })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Sair da conta' }))
    expect(router.state.location.pathname).toBe('/mapa')
  })

  it('visitante vê o convite para entrar no perfil', async () => {
    abrir('/perfil')
    expect(
      await screen.findByRole('heading', { name: 'Entre para acompanhar sua participação' }),
    ).toBeInTheDocument()
  })
})

describe('recentes', () => {
  it('lista os problemas perto de Icaraí e filtra por grupo', async () => {
    const usuario = userEvent.setup()
    abrir('/recentes')

    expect(await screen.findAllByRole('link', { name: /Buraco na via/ })).not.toHaveLength(0)
    expect(screen.getByText('Perto de Icaraí · até 10 km')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: /Elétrica/ }))
    await waitFor(() =>
      expect(screen.queryAllByRole('link', { name: /Buraco na via/ })).toHaveLength(0),
    )
    expect(screen.getAllByRole('link', { name: /Poste apagado|Fio caído/ }).length).toBeGreaterThan(
      0,
    )
  })
})
