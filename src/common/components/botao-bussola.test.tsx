import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapaFalso } from '@/test/maplibre-falso'

import { BotaoBussola } from './botao-bussola'
import { MapaVetorial } from './mapa-vetorial'

function renderizar() {
  return render(
    <MapaVetorial centro={[-22.95, -43.18]}>
      <BotaoBussola />
    </MapaVetorial>,
  )
}

describe('BotaoBussola', () => {
  it('fica escondida com o mapa apontando para o norte', () => {
    renderizar()
    expect(screen.queryByRole('button', { name: /norte/i })).not.toBeInTheDocument()
  })

  it('aparece ao girar e o mostrador acompanha o giro', () => {
    renderizar()
    act(() => mapaFalso.girar(45))

    const botao = screen.getByRole('button', { name: 'Apontar para o norte' })
    expect(botao.querySelector('[data-mostrador]')).toHaveStyle({ transform: 'rotate(-45deg)' })

    act(() => mapaFalso.girar(90))
    expect(botao.querySelector('[data-mostrador]')).toHaveStyle({ transform: 'rotate(-90deg)' })
  })

  it.each([
    [10, 'N'],
    [-30, 'N'],
    [80, 'L'],
    [180, 'S'],
    [-170, 'S'],
    [-90, 'O'],
    [300, 'O'],
  ])('com o topo da tela a %s° mostra a letra %s', (giro, letra) => {
    renderizar()
    act(() => mapaFalso.girar(giro))
    expect(screen.getByRole('button', { name: 'Apontar para o norte' })).toHaveTextContent(letra)
  })

  it('aparece com o mapa inclinado mesmo sem giro', () => {
    renderizar()
    act(() => mapaFalso.girar(0, 40))
    expect(screen.getByRole('button', { name: 'Apontar para o norte' })).toBeInTheDocument()
  })

  it('ao tocar, endireita para o norte e some', async () => {
    renderizar()
    act(() => mapaFalso.girar(-120, 30))

    await userEvent.click(screen.getByRole('button', { name: 'Apontar para o norte' }))

    expect(mapaFalso.atual()!.getBearing()).toBe(0)
    expect(mapaFalso.atual()!.getPitch()).toBe(0)
    expect(screen.queryByRole('button', { name: /norte/i })).not.toBeInTheDocument()
  })
})
