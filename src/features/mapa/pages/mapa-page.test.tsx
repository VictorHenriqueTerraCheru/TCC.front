import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { useWatchLocation } from '@/features/localizacao'
import { database } from '@/infrastructure/mocks/banco'
import { route } from '@/infrastructure/mocks/rota'
import { server } from '@/infrastructure/mocks/server'
import { fakeMap } from '@/test/maplibre-falso'
import { setWidth, renderRoutes } from '@/test/render'

import { MapPage } from './mapa-page'

function MapWithLocation() {
  useWatchLocation()
  return <MapPage />
}

function renderMap(path = '/mapa') {
  setWidth(390)
  return renderRoutes([{ path: '/mapa', element: <MapWithLocation /> }], path)
}

describe('MapPage', () => {
  it('switches mode and shows the chips of the chosen mode', async () => {
    const user = userEvent.setup()
    const { router } = renderMap()

    expect(screen.getByRole('radio', { name: /Problemas/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByRole('button', { name: /Segurança/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Incidentes/ }))

    expect(router.state.location.search).toBe('?mode=incidents')
    expect(await screen.findByRole('button', { name: /Segurança/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Via pública/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Em avaliação/ })).not.toBeInTheDocument()
  })

  it('link with a chip from another mode is ignored (does not clear the layers)', async () => {
    renderMap('/mapa?groups=seguranca')

    expect(screen.getByRole('radio', { name: /Problemas/ })).toHaveAttribute('aria-checked', 'true')
    for (const chip of [/Via pública/, /Elétrica/, /Limpeza/]) {
      expect(await screen.findByRole('button', { name: chip })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    }
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('switching mode before the groups arrive does not clear the link chips', async () => {
    let release = () => {}
    const wait = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.get(route('/groups'), async () => {
        await wait
        return HttpResponse.json(database.groups())
      }),
    )
    const user = userEvent.setup()
    const { router } = renderMap('/mapa?mode=incidents&groups=seguranca')

    await user.click(screen.getByRole('radio', { name: /Ambos/ }))
    expect(router.state.location.search).toContain('groups=seguranca')
    release()
    expect(await screen.findByRole('button', { name: /Segurança/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('failure on GET /grupos shows the map error instead of hiding the layers', async () => {
    server.use(http.get(route('/groups'), () => new HttpResponse(null, { status: 500 })))
    renderMap()

    expect(await screen.findByText('Não foi possível carregar o mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('failure on GET /categorias shows the map error with "Tentar novamente"', async () => {
    server.use(http.get(route('/categories'), () => new HttpResponse(null, { status: 500 })))
    renderMap()

    expect(await screen.findByText('Não foi possível carregar o mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('empty area notice disappears when moving the map and does not come back on every empty area', async () => {
    server.use(http.get(route('/issues'), () => HttpResponse.json([])))
    renderMap()

    expect(await screen.findByText('Nenhuma ocorrência nesta área')).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByTestId('map'))

    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
  })

  it('the empty area notice X closes it for good', async () => {
    const user = userEvent.setup()
    let queries = 0
    server.use(
      http.get(route('/issues'), () => {
        queries++
        return HttpResponse.json([])
      }),
    )
    const { unmount } = renderMap()

    await user.click(await screen.findByRole('button', { name: 'Fechar aviso' }))

    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
    expect(localStorage.getItem('ocorrencias.avisoVazioFechado')).toBe('1')

    unmount()
    const before = queries
    renderMap()
    await waitFor(() => expect(queries).toBeGreaterThan(before))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText('Nenhuma ocorrência nesta área')).not.toBeInTheDocument()
  })

  it('tapping the map in Ambos mode without incidents shows the notice and does not open the area', async () => {
    server.use(http.get(route('/incidents/area'), () => HttpResponse.json({ counts: [] })))
    const { router } = renderMap('/mapa?mode=both')
    await screen.findByTestId('map')

    act(() => fakeMap.tap(-22.95, -43.18))

    expect(
      await screen.findByText('Sem incidentes por aqui nos últimos 7 dias'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mapa')
  })

  it('bounds sent to the API stay within ±180 even with the map zoomed out (rule 15)', async () => {
    const requests: URL[] = []
    server.use(
      http.get(route('/issues'), ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json([])
      }),
    )
    renderMap()
    await screen.findByTestId('map')

    act(() => fakeMap.move({ lat: 0, lng: 0 }, { south: -80, west: -200, north: 80, east: 200 }))

    await waitFor(() => expect(requests.at(-1)?.searchParams.get('minLng')).toBe('-180'), {
      timeout: 2000,
    })
    expect(requests.at(-1)!.searchParams.get('maxLng')).toBe('180')
  })

  it('marks filter chips in the URL and clears those that do not exist in the new mode', async () => {
    const user = userEvent.setup()
    const { router } = renderMap('/mapa?mode=both')

    await user.click(await screen.findByRole('button', { name: /Elétrica/ }))
    await user.click(await screen.findByRole('button', { name: /Segurança/ }))
    await user.click(screen.getByRole('button', { name: /Em avaliação/ }))

    expect(screen.getByRole('button', { name: /Elétrica/ })).toHaveAttribute('aria-pressed', 'true')
    expect(new URLSearchParams(router.state.location.search).get('groups')).toBe(
      'eletrica,seguranca',
    )

    await user.click(screen.getByRole('radio', { name: /Problemas/ }))

    const params = new URLSearchParams(router.state.location.search)
    expect(params.get('groups')).toBe('eletrica')
    expect(params.get('new')).toBe('1')
  })

  it('without Geolocation (jsdom) does not show the banner and the GPS opens the help', async () => {
    const user = userEvent.setup()
    renderMap()

    expect(screen.queryByText(/Localização desativada/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ativar localização' }))
    expect(await screen.findByRole('dialog', { name: 'Como liberar a localização' })).toBeVisible()
  })
})
