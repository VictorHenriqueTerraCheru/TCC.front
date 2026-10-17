import { act, screen } from '@testing-library/react'

import { distanciaTexto } from '@/common/lib/formatacao'
import type { CategoriaResumo } from '@/features/categorias'
import { mapaFalso } from '@/test/maplibre-falso'
import { renderizar } from '@/test/render'

import { useRascunhoStore } from '../stores/rascunho-store'
import { MapaRegistro } from './mapa-registro'

const buraco: CategoriaResumo = {
  id: 1,
  nome: 'Buraco na via',
  grupo: 'viaPublica',
  icone: 'buraco',
}

afterEach(() => useRascunhoStore.getState().limpar())

describe('MapaRegistro', () => {
  it('modo pino grava o centro do mapa como local ao parar de mover', () => {
    renderizar(<MapaRegistro modo="pino" categoria={buraco} />)

    act(() => mapaFalso.mover({ lat: -22.95, lng: -43.18 }))

    expect(useRascunhoStore.getState().local).toEqual({ lat: -22.95, lng: -43.18 })
  })

  it('modo área desenha o raio de 150 m', () => {
    renderizar(<MapaRegistro modo="area" />)

    expect(screen.getByTestId('fonte-registro-area')).toHaveAttribute('data-pontos', '1')
  })

  it('conferência mostra a distância entre os pinos', () => {
    renderizar(
      <MapaRegistro
        modo="conferencia"
        novo={{ lat: -22.9519, lng: -43.1866 }}
        existente={{ lat: -22.9521, lng: -43.1867, categoria: buraco, distanciaMetros: 30 }}
      />,
    )

    expect(screen.getByText(distanciaTexto(30))).toBeInTheDocument()
    expect(screen.getAllByTestId('marcador').length).toBeGreaterThanOrEqual(2)
  })
})
