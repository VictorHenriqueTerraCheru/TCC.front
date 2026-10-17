import { act, render, screen } from '@testing-library/react'

import { useTemaStore } from '@/common/hooks/use-tema'
import { mapaFalso } from '@/test/maplibre-falso'

import { MapaVetorial } from './mapa-vetorial'

describe('MapaVetorial', () => {
  it('nasce no centro [lat, lng] e devolve o toque como { lat, lng }', () => {
    const aoTocar = vi.fn()
    render(<MapaVetorial centro={[-22.95, -43.18]} aoTocar={aoTocar} />)

    expect(screen.getByTestId('mapa')).toBeInTheDocument()
    expect(mapaFalso.atual()!.getCenter()).toEqual({ lat: -22.95, lng: -43.18 })

    mapaFalso.tocar(-22.9, -43.1)
    expect(aoTocar).toHaveBeenCalledWith({ lat: -22.9, lng: -43.1 })
  })

  it('usa o estilo do tema atual e troca junto com ele', () => {
    useTemaStore.setState({ preferencia: 'claro' })
    render(<MapaVetorial centro={[0, 0]} />)
    expect(screen.getByTestId('mapa')).toHaveAttribute('data-estilo', 'ocorrencias-claro')

    act(() => useTemaStore.getState().definirPreferencia('escuro'))
    expect(screen.getByTestId('mapa')).toHaveAttribute('data-estilo', 'ocorrencias-escuro')
  })

  it('avisa ao parar de mover', () => {
    const aoParar = vi.fn()
    render(<MapaVetorial centro={[0, 0]} aoParar={aoParar} />)

    mapaFalso.mover({ lat: 1, lng: 2 })
    expect(aoParar).toHaveBeenCalledTimes(1)
  })
})
