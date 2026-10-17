import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { useMonitorarLocalizacao } from '@/features/localizacao'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { definirLargura, renderizarRotas } from '@/test/render'

import { MapaPage } from './mapa-page'

// O layout do app liga o monitor de localização; aqui a página é montada sozinha.
function MapaComLocalizacao() {
  useMonitorarLocalizacao()
  return <MapaPage />
}

function renderizarMapa(caminho = '/mapa') {
  definirLargura(390)
  return renderizarRotas([{ path: '/mapa', element: <MapaComLocalizacao /> }], caminho)
}

describe('MapaPage', () => {
  it('troca de modo e mostra os chips do modo escolhido', async () => {
    const usuario = userEvent.setup()
    const { router } = renderizarMapa()

    expect(screen.getByRole('radio', { name: /Problemas/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByRole('button', { name: /Segurança/ })).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('radio', { name: /Incidentes/ }))

    expect(router.state.location.search).toBe('?modo=incidentes')
    expect(screen.getByRole('button', { name: /Segurança/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Via pública/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Em avaliação/ })).not.toBeInTheDocument()
  })

  it('link com chip de outro modo é ignorado (não apaga as camadas)', async () => {
    renderizarMapa('/mapa?grupos=seguranca')

    expect(screen.getByRole('radio', { name: /Problemas/ })).toHaveAttribute('aria-checked', 'true')
    for (const chip of [/Via pública/, /Elétrica/, /Limpeza/]) {
      expect(screen.getByRole('button', { name: chip })).toHaveAttribute('aria-pressed', 'false')
    }
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('falha em GET /categorias mostra o erro do mapa com "Tentar novamente"', async () => {
    server.use(http.get(rota('/categorias'), () => new HttpResponse(null, { status: 500 })))
    renderizarMapa()

    expect(await screen.findByText('Não foi possível carregar o mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('marca chips de filtro na URL e limpa os que não existem no novo modo', async () => {
    const usuario = userEvent.setup()
    const { router } = renderizarMapa('/mapa?modo=ambos')

    await usuario.click(screen.getByRole('button', { name: /Elétrica/ }))
    await usuario.click(screen.getByRole('button', { name: /Segurança/ }))
    await usuario.click(screen.getByRole('button', { name: /Em avaliação/ }))

    expect(screen.getByRole('button', { name: /Elétrica/ })).toHaveAttribute('aria-pressed', 'true')
    expect(new URLSearchParams(router.state.location.search).get('grupos')).toBe(
      'eletrica,seguranca',
    )

    await usuario.click(screen.getByRole('radio', { name: /Problemas/ }))

    const params = new URLSearchParams(router.state.location.search)
    expect(params.get('grupos')).toBe('eletrica')
    expect(params.get('nova')).toBe('1')
  })

  it('sem Geolocation (jsdom) não mostra o banner e o GPS abre a ajuda', async () => {
    const usuario = userEvent.setup()
    renderizarMapa()

    expect(screen.queryByText(/Localização desativada/)).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Ativar localização' }))
    expect(await screen.findByRole('dialog', { name: 'Como liberar a localização' })).toBeVisible()
  })
})
