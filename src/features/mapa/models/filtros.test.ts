import { groups } from '@/infrastructure/mocks/fixtures/grupos'

import { layerFilters, modeGroups } from './filtros'

const keys = (mode: Parameters<typeof modeGroups>[1]) => modeGroups(groups, mode).map((g) => g.key)

describe('map filters', () => {
  it('each mode offers the chips of its type', () => {
    expect(keys('issues')).toEqual(['viaPublica', 'eletrica', 'limpeza'])
    expect(keys('incidents')).toEqual(['seguranca', 'transito'])
    expect(keys('both')).toHaveLength(5)
  })

  it('a group created by the admin appears in the mode of its type', () => {
    const withNew = [
      ...groups,
      {
        key: 'clima',
        label: 'Clima',
        type: 'incident' as const,
        color: 'blue' as const,
        sortOrder: 6,
      },
    ]
    expect(modeGroups(withNew, 'incidents').map((g) => g.key)).toEqual([
      'seguranca',
      'transito',
      'clima',
    ])
  })

  it('Ambos respects the configured order, mixing the types', () => {
    const inOrder = [groups[3]!, groups[0]!, groups[4]!, groups[1]!, groups[2]!]

    expect(modeGroups(inOrder, 'both').map((g) => g.key)).toEqual(inOrder.map((g) => g.key))
  })

  it('Problemas turns on only the markers; Incidentes only the heatmap', () => {
    expect(layerFilters({ mode: 'issues', groups: [], onlyNew: false }, groups)).toEqual({
      issues: { groups: [], status: [] },
      heatmap: null,
    })
    expect(layerFilters({ mode: 'incidents', groups: [], onlyNew: false }, groups)).toEqual({
      issues: null,
      heatmap: { groups: [] },
    })
  })

  it('the hourglass chip asks for status=new', () => {
    expect(
      layerFilters({ mode: 'issues', groups: ['eletrica'], onlyNew: true }, groups).issues,
    ).toEqual({ groups: ['eletrica'], status: ['new'] })
  })

  it('in Ambos, checking only an incident group turns the markers off', () => {
    expect(layerFilters({ mode: 'both', groups: ['seguranca'], onlyNew: false }, groups)).toEqual({
      issues: null,
      heatmap: { groups: ['seguranca'] },
    })
  })
})
