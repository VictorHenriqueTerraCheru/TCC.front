import { act, screen } from '@testing-library/react'

import { distanceText } from '@/common/lib/formatting'
import type { CategorySummary } from '@/features/categories'
import { fakeMap } from '@/test/fake-maplibre'
import { renderWithProviders } from '@/test/render'

import { useDraftStore } from '../stores/draft-store'
import { ReportMap } from './report-map'

const buraco: CategorySummary = {
  id: 1,
  name: 'Buraco na via',
  group: 'viaPublica',
  icon: 'buraco',
}

afterEach(() => useDraftStore.getState().clear())

describe('ReportMap', () => {
  it('pin mode saves the map center as the location when it stops moving', () => {
    renderWithProviders(<ReportMap mode="pin" category={buraco} />)

    act(() => fakeMap.move({ lat: -22.95, lng: -43.18 }))

    expect(useDraftStore.getState().location).toEqual({ lat: -22.95, lng: -43.18 })
  })

  it('moveend with the same center (resize) does not change the location', () => {
    renderWithProviders(<ReportMap mode="pin" category={buraco} />)
    act(() => fakeMap.move({ lat: -22.95, lng: -43.18 }))
    const before = useDraftStore.getState().location

    act(() => fakeMap.move({ lat: -22.95, lng: -43.18 }))

    expect(useDraftStore.getState().location).toBe(before)
  })

  it('area mode draws the 150 m radius', () => {
    renderWithProviders(<ReportMap mode="area" />)

    expect(screen.getByTestId('source-report-area')).toHaveAttribute('data-points', '1')
  })

  it('duplicate check shows the distance between the pins', () => {
    renderWithProviders(
      <ReportMap
        mode="duplicateCheck"
        newPoint={{ lat: -22.9519, lng: -43.1866 }}
        existing={{ lat: -22.9521, lng: -43.1867, category: buraco, distanceMeters: 30 }}
      />,
    )

    expect(screen.getByText(distanceText(30))).toBeInTheDocument()
    expect(screen.getAllByTestId('marker').length).toBeGreaterThanOrEqual(2)
  })
})
