import { render, screen } from '@testing-library/react'

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

  it('avisa ao parar de mover', () => {
    const aoParar = vi.fn()
    render(<MapaVetorial centro={[0, 0]} aoParar={aoParar} />)

    mapaFalso.mover({ lat: 1, lng: 2 })
    expect(aoParar).toHaveBeenCalledTimes(1)
  })
})
