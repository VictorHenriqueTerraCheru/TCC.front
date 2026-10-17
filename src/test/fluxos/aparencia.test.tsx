import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { rotas } from '@/app/router'
import { useTemaStore } from '@/common/hooks/use-tema'
import { definirLargura, renderizarRotas } from '@/test/render'
import { entrarComoCidadao, sair } from '@/test/sessao'

function navegadorEmPrompt() {
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: { getCurrentPosition: vi.fn(), watchPosition: vi.fn(), clearWatch: vi.fn() },
    permissions: {
      query: () =>
        Promise.resolve({ state: 'prompt', addEventListener() {}, removeEventListener() {} }),
    },
  })
}

const opcao = (nome: string) => screen.getByRole('radio', { name: new RegExp(nome) })

describe('aparência (claro, escuro ou automático)', () => {
  beforeEach(() => {
    definirLargura(390)
    useTemaStore.setState(useTemaStore.getInitialState())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.tema
  })

  it('na primeira abertura pede o tema, com Automático marcado, e volta para onde estava', async () => {
    const usuario = userEvent.setup()
    const { router } = renderizarRotas(rotas, '/mapa?modo=ambos')

    expect(await screen.findByRole('heading', { name: 'Escolha a aparência' })).toBeInTheDocument()
    expect(opcao('Automático')).toHaveAttribute('aria-checked', 'true')

    await usuario.click(opcao('Escuro'))
    expect(opcao('Escuro')).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.dataset.tema).toBe('escuro') // já mostra como fica

    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(router.state.location.pathname).toBe('/mapa')
    expect(router.state.location.search).toBe('?modo=ambos')
    expect(useTemaStore.getState()).toMatchObject({ preferencia: 'escuro', escolhido: true })
  })

  it('depois de escolhido, não aparece de novo', async () => {
    useTemaStore.setState({ escolhido: true })
    renderizarRotas(rotas, '/mapa')

    expect(
      await screen.findByRole('radiogroup', { name: 'O que mostrar no mapa' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Escolha a aparência')).not.toBeInTheDocument()
  })

  it('vem antes da pré-permissão de localização', async () => {
    navegadorEmPrompt()
    const usuario = userEvent.setup()
    renderizarRotas(rotas, '/mapa')

    expect(await screen.findByRole('heading', { name: 'Escolha a aparência' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      await screen.findByRole('heading', { name: 'Permitir acesso à sua localização?' }),
    ).toBeInTheDocument()
  })

  it('Configurações troca o tema na hora', async () => {
    useTemaStore.setState({ preferencia: 'escuro', escolhido: true })
    entrarComoCidadao()
    const usuario = userEvent.setup()
    renderizarRotas(rotas, '/perfil/configuracoes')

    expect(await screen.findByRole('radiogroup', { name: 'Aparência' })).toBeInTheDocument()
    expect(opcao('Escuro')).toHaveAttribute('aria-checked', 'true')

    await usuario.click(opcao('Claro'))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(useTemaStore.getState().preferencia).toBe('claro')
    sair()
  })
})
