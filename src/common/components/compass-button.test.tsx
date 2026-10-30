import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { fakeMap } from '@/test/fake-maplibre'

import { CompassButton } from './compass-button'
import { VectorMap } from './vector-map'

function renderWithProviders() {
  return render(
    <VectorMap center={[-22.95, -43.18]}>
      <CompassButton />
    </VectorMap>,
  )
}

describe('CompassButton', () => {
  it('stays hidden while the map points north', () => {
    renderWithProviders()
    expect(screen.queryByRole('button', { name: /norte/i })).not.toBeInTheDocument()
  })

  it('appears when rotated and the dial follows the rotation', () => {
    renderWithProviders()
    act(() => fakeMap.rotate(45))

    const button = screen.getByRole('button', { name: 'Apontar para o norte' })
    expect(button.querySelector('[data-mostrador]')).toHaveStyle({ transform: 'rotate(-45deg)' })

    act(() => fakeMap.rotate(90))
    expect(button.querySelector('[data-mostrador]')).toHaveStyle({ transform: 'rotate(-90deg)' })
  })

  it.each([
    [10, 'N'],
    [-30, 'N'],
    [80, 'L'],
    [180, 'S'],
    [-170, 'S'],
    [-90, 'O'],
    [300, 'O'],
  ])('with the top of the screen at %s° shows the letter %s', (rotation, letter) => {
    renderWithProviders()
    act(() => fakeMap.rotate(rotation))
    expect(screen.getByRole('button', { name: 'Apontar para o norte' })).toHaveTextContent(letter)
  })

  it('appears when the map is tilted even without rotation', () => {
    renderWithProviders()
    act(() => fakeMap.rotate(0, 40))
    expect(screen.getByRole('button', { name: 'Apontar para o norte' })).toBeInTheDocument()
  })

  it('on tap, turns back north and disappears', async () => {
    renderWithProviders()
    act(() => fakeMap.rotate(-120, 30))

    await userEvent.click(screen.getByRole('button', { name: 'Apontar para o norte' }))

    expect(fakeMap.current()!.getBearing()).toBe(0)
    expect(fakeMap.current()!.getPitch()).toBe(0)
    expect(screen.queryByRole('button', { name: /norte/i })).not.toBeInTheDocument()
  })
})
