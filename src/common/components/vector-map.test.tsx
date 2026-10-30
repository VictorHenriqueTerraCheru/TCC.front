import { act, render, screen } from '@testing-library/react'

import { useThemeStore } from '@/common/hooks/use-theme'
import { fakeMap } from '@/test/fake-maplibre'

import { VectorMap } from './vector-map'

describe('VectorMap', () => {
  it('starts at center [lat, lng] and reports taps as { lat, lng }', () => {
    const onTap = vi.fn()
    render(<VectorMap center={[-22.95, -43.18]} onTap={onTap} />)

    expect(screen.getByTestId('map')).toBeInTheDocument()
    expect(fakeMap.current()!.getCenter()).toEqual({ lat: -22.95, lng: -43.18 })

    fakeMap.tap(-22.9, -43.1)
    expect(onTap).toHaveBeenCalledWith({ lat: -22.9, lng: -43.1 })
  })

  it('uses the current theme style and switches along with it', () => {
    useThemeStore.setState({ preference: 'light' })
    render(<VectorMap center={[0, 0]} />)
    expect(screen.getByTestId('map')).toHaveAttribute('data-style', 'ocorrencias-claro')

    act(() => useThemeStore.getState().setPreference('dark'))
    expect(screen.getByTestId('map')).toHaveAttribute('data-style', 'ocorrencias-escuro')
  })

  it('notifies when it stops moving', () => {
    const onStop = vi.fn()
    render(<VectorMap center={[0, 0]} onStop={onStop} />)

    fakeMap.move({ lat: 1, lng: 2 })
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
