import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { rotas } from '@/app/router'
import { definirLargura, renderizarRotas } from '@/test/render'

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

describe('pré-permissão de localização (tela 17)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('na primeira abertura em prompt, explica antes de pedir; "Agora não" volta ao mapa', async () => {
    navegadorEmPrompt()
    definirLargura(390)
    const usuario = userEvent.setup()
    const { router } = renderizarRotas(rotas, '/mapa?modo=ambos')

    expect(
      await screen.findByRole('heading', { name: 'Permitir acesso à sua localização?' }),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Agora não' }))

    expect(router.state.location.pathname).toBe('/mapa')
    expect(router.state.location.search).toBe('?modo=ambos')
    expect(localStorage.getItem('ocorrencias.prePermissaoVista')).toBe('1')
  })

  it('depois de vista, não aparece de novo', async () => {
    navegadorEmPrompt()
    localStorage.setItem('ocorrencias.prePermissaoVista', '1')
    definirLargura(390)
    renderizarRotas(rotas, '/mapa')

    expect(
      await screen.findByRole('radiogroup', { name: 'O que mostrar no mapa' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Permitir acesso à sua localização?')).not.toBeInTheDocument()
  })
})
