import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { routes } from '@/app/router'
import { database } from '@/infrastructure/mocks/database'
import { route } from '@/infrastructure/mocks/route'
import { server } from '@/infrastructure/mocks/server'
import { setWidth, renderRoutes } from '@/test/render'
import { loginAsAdmin, loginAsCitizen, logout } from '@/test/session'

function openAt(path: string) {
  setWidth(390)
  return renderRoutes(routes, path)
}

const JUSTIFICATION = 'Moro na Rua São Clemente há 8 anos e passo pelo trecho todos os dias.'

describe('profile, verification and admin queue', () => {
  afterEach(logout)

  it('acceptance of stage 5: citizen requests → admin approves → profile shows "Perfil verificado"', async () => {
    const user = userEvent.setup()

    loginAsCitizen()
    const citizen = openAt('/perfil')
    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeInTheDocument()
    expect(screen.getByText('Cidadão')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Solicitar verificação' }))
    await user.type(await screen.findByLabelText('Justificativa *'), JUSTIFICATION)
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    expect(await screen.findByText('Pedido em análise')).toBeInTheDocument()
    citizen.unmount()

    logout()
    loginAsAdmin()
    const admin = openAt('/admin/verificacoes')
    const request = await screen.findByRole('article', { name: 'Pedido de Ana Lima' })
    expect(screen.getByRole('tab', { name: 'Pendentes · 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(within(request).getByRole('button', { name: 'Aprovar' }))
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Pedido de Ana Lima' })).not.toBeInTheDocument(),
    )
    admin.unmount()

    logout()
    loginAsCitizen()
    openAt('/perfil')
    expect(await screen.findByText('Perfil verificado')).toBeInTheDocument()
    expect(screen.getByText('Seu voto tem peso maior')).toBeInTheDocument()
  })

  it('rejection requires a reason and the person sees the "Recusada" banner when asking again', async () => {
    const user = userEvent.setup()

    loginAsCitizen()
    const citizen = openAt('/perfil/verificacao')
    await user.type(await screen.findByLabelText('Justificativa *'), JUSTIFICATION)
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))
    await screen.findByText('Pedido em análise')
    citizen.unmount()

    logout()
    loginAsAdmin()
    const admin = openAt('/admin/verificacoes')
    const request = await screen.findByRole('article', { name: 'Pedido de Ana Lima' })
    await user.click(within(request).getByRole('button', { name: 'Recusar' }))
    const confirm = within(request).getByRole('button', { name: 'Confirmar recusa' })
    expect(confirm).toBeDisabled()
    await user.type(
      within(request).getByLabelText('Motivo da recusa *'),
      'Sem vínculo com a região.',
    )
    await user.click(confirm)
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'Pedido de Ana Lima' })).not.toBeInTheDocument(),
    )
    admin.unmount()

    logout()
    loginAsCitizen()
    openAt('/perfil/verificacao')
    expect(await screen.findByText('Recusada')).toBeInTheDocument()
    expect(screen.getByText('Motivo: Sem vínculo com a região.')).toBeInTheDocument()
  })

  it('short justification shows the prototype error', async () => {
    const user = userEvent.setup()
    loginAsCitizen()
    openAt('/perfil/verificacao')

    await user.type(await screen.findByLabelText('Justificativa *'), 'curta')
    await user.click(screen.getByRole('button', { name: 'Enviar pedido' }))

    expect(
      await screen.findByText('Campo obrigatório — escreva pelo menos 30 caracteres.'),
    ).toBeInTheDocument()
  })

  it('citizen cannot access the admin queue', async () => {
    loginAsCitizen()
    openAt('/admin/verificacoes')
    expect(await screen.findByText('Esta área é só para administradores.')).toBeInTheDocument()
  })

  it('admin with /me down sees "Tentar novamente", not "só para administradores"', async () => {
    loginAsAdmin()
    server.use(http.get(route('/me'), () => new HttpResponse(null, { status: 500 })))
    openAt('/admin/verificacoes')

    expect(
      await screen.findByText('Não foi possível confirmar seu perfil.', {}, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Esta área é só para administradores.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('"Cancelar" while editing the name discards the typed text', async () => {
    loginAsCitizen()
    const user = userEvent.setup()
    openAt('/perfil/configuracoes')

    await user.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))
    await user.clear(screen.getByLabelText('Nome'))
    await user.type(screen.getByLabelText('Nome'), 'Rascunho descartado')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))

    expect(await screen.findByLabelText('Nome')).toHaveValue('Ana Lima')
  })

  it('history groups by period and filters by votes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 15, 0))
    onTestFinished(() => {
      vi.useRealTimers()
    })
    database.reset()
    const user = userEvent.setup()
    loginAsCitizen()
    openAt('/perfil/historico')

    expect(await screen.findByRole('heading', { name: 'Hoje' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ontem' })).toBeInTheDocument()
    expect(screen.getByText('Registrou · Roubo (anônimo)')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Votos' }))
    await waitFor(() => expect(screen.queryByText(/^Registrou/)).not.toBeInTheDocument())
    expect(screen.getByText('Disse que está lá · Buraco na via')).toBeInTheDocument()
  })

  it('settings: edits the name and signs out', async () => {
    const user = userEvent.setup()
    loginAsCitizen()
    const { router } = openAt('/perfil/configuracoes')

    await user.click(await screen.findByRole('button', { name: /Nome\s*Ana Lima/ }))
    const field = screen.getByLabelText('Nome')
    await user.clear(field)
    await user.type(field, 'Ana L.')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('button', { name: /Nome\s*Ana L\./ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair da conta' }))
    expect(router.state.location.pathname).toBe('/mapa')
  })

  it('guest sees the invitation to log in on the profile', async () => {
    openAt('/perfil')
    expect(
      await screen.findByRole('heading', { name: 'Entre para acompanhar sua participação' }),
    ).toBeInTheDocument()
  })
})

describe('recent', () => {
  it('lists the issues near Icaraí and filters by group', async () => {
    const user = userEvent.setup()
    openAt('/recentes')

    expect(await screen.findAllByRole('link', { name: /Buraco na via/ })).not.toHaveLength(0)
    expect(screen.getByText('Perto de Icaraí · até 10 km')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Elétrica/ }))
    await waitFor(() =>
      expect(screen.queryAllByRole('link', { name: /Buraco na via/ })).toHaveLength(0),
    )
    expect(screen.getAllByRole('link', { name: /Poste apagado|Fio caído/ }).length).toBeGreaterThan(
      0,
    )
  })
})
