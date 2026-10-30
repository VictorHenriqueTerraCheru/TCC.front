import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VectorMap } from '@/common/components/vector-map'
import type { Category } from '@/features/categories'
import { categories } from '@/infrastructure/mocks/fixtures/categories'
import { issuesInArea } from '@/infrastructure/mocks/fixtures/issues'
import { renderWithProviders } from '@/test/render'

import { IssueLayer } from './issue-layer'

const byId = new Map(categories.map((c) => [c.id, c as Category]))

function mount(selectedId?: string, map = byId) {
  const onSelect = vi.fn()
  const onTap = vi.fn()
  renderWithProviders(
    <VectorMap center={[-22.9519, -43.1866]} onTap={onTap}>
      <IssueLayer
        issues={issuesInArea}
        categories={map}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </VectorMap>,
  )
  return { onSelect, onTap }
}

describe('IssueLayer', () => {
  it('clicking the marker selects the issue and does not reach the map tap (rule 7)', async () => {
    const { onSelect, onTap } = mount()

    await userEvent.click(screen.getAllByTestId('marker')[0]!)

    expect(onSelect).toHaveBeenCalledWith(issuesInArea[0]!.id)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('selected marker stays on top; high above low', () => {
    const high = issuesInArea.find((p) => p.band === 'high' && p.status !== 'new')!
    const low = issuesInArea.find((p) => p.band === 'low' && p.status !== 'new')!
    mount(low.id)

    const zIndexOf = (id: string) =>
      screen.getAllByTestId('marker').find((m) => m.querySelector(`[data-issue="${id}"]`))!.style
        .zIndex
    expect(zIndexOf(low.id)).toBe('1000')
    expect(zIndexOf(high.id)).toBe('300')
  })

  it('issue of a deactivated category stays on the map, in gray', () => {
    mount(undefined, new Map())

    expect(screen.getAllByTestId('marker')).toHaveLength(issuesInArea.length)
    expect(screen.getAllByRole('button', { name: 'Problema' })).toHaveLength(issuesInArea.length)
  })
})
