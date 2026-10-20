import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { useMonitorarLocalizacao } from '@/features/localizacao'
import { rota } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { mapaFalso } from '@/test/maplibre-falso'
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
    expect(await screen.findByRole('button', { name: /Segurança/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Via pública/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Em avaliação/ })).not.toBeInTheDocument()
  })

  it('link com chip de outro modo é ignorado (não apaga as camadas)', async () => {
    renderizarMapa('/mapa?grupos=seguranca')

    expect(screen.getByRole('radio', { name: /Problemas/ })).toHaveAttribute('aria-checked', 'true')
    for (const chip of [/Via pública/, /Elétrica/, /Limpeza/]) {
      expect(await screen.findByRole('button', { name: chip })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    }
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('falha em GET /grupos mostra o erro do mapa em vez de sumir com as camadas', async () => {
    server.use(http.get(rota('/grupos'), () => new HttpResponse(null, { status: 500 })))
    renderizarMapa()

    expect(await screen.findByText('Não foi possível carregar o mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('falha em GET /categorias mostra o erro do mapa com "Tentar novamente"', async () => {
    server.use(http.get(rota('/categorias'), () => new HttpResponse(null, { status: 500 })))
    renderizarMapa()

    expect(await screen.findByText('Não foi possível carregar o mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('aviso de área vazia some ao mexer no mapa e não volta a cada área vazia', async () => {
    server.use(http.get(rota('/problemas'), () => HttpResponse.json([])))
    renderizarMapa()

    expect(await screen.findByText('Nenhuma ocorrência nesta área')).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByTestId('mapa'))

    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
  })

  it('X do aviso de área vazia fecha de vez', async () => {
    const usuario = userEvent.setup()
    let consultas = 0
    server.use(
      http.get(rota('/problemas'), () => {
        consultas++
        return HttpResponse.json([])
      }),
    )
    const { unmount } = renderizarMapa()

    await usuario.click(await screen.findByRole('button', { name: 'Fechar aviso' }))

    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
    expect(localStorage.getItem('ocorrencias.avisoVazioFechado')).toBe('1')

    unmount()
    const antes = consultas
    renderizarMapa()
    await waitFor(() => expect(consultas).toBeGreaterThan(antes))
    await new Promise((resolver) => setTimeout(resolver, 50))
    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
  })

  it('toque no mapa no modo Ambos sem incidentes mostra o aviso e não abre a área', async () => {
    server.use(http.get(rota('/incidentes/area'), () => HttpResponse.json({ contagens: [] })))
    const { router } = renderizarMapa('/mapa?modo=ambos')
    await screen.findByTestId('mapa')

    act(() => mapaFalso.tocar(-22.95, -43.18))

    expect(
      await screen.findByText('Sem incidentes por aqui nos últimos 7 dias'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mapa')
  })

  it('retângulo enviado à API fica dentro de ±180 mesmo com o mapa afastado (regra 15)', async () => {
    const pedidos: URL[] = []
    server.use(
      http.get(rota('/problemas'), ({ request }) => {
        pedidos.push(new URL(request.url))
        return HttpResponse.json([])
      }),
    )
    renderizarMapa()
    await screen.findByTestId('mapa')

    act(() => mapaFalso.mover({ lat: 0, lng: 0 }, { sul: -80, oeste: -200, norte: 80, leste: 200 }))

    await waitFor(() => expect(pedidos.at(-1)?.searchParams.get('minLng')).toBe('-180'), {
      timeout: 2000,
    })
    expect(pedidos.at(-1)!.searchParams.get('maxLng')).toBe('180')
  })

  it('marca chips de filtro na URL e limpa os que não existem no novo modo', async () => {
    const usuario = userEvent.setup()
    const { router } = renderizarMapa('/mapa?modo=ambos')

    await usuario.click(await screen.findByRole('button', { name: /Elétrica/ }))
    await usuario.click(await screen.findByRole('button', { name: /Segurança/ }))
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
