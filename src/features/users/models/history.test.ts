import type { HistoryItem } from './history'
import { groupByPeriod, itemTitle } from './history'

const now = new Date('2026-10-06T12:00:00')
const item = (data: string, extra: Partial<HistoryItem> = {}) =>
  ({
    type: 'vote',
    value: 'yes',
    category: { id: 1, name: 'Buraco na via', group: 'viaPublica', icon: 'buraco' },
    date: data,
    ...extra,
  }) as HistoryItem

describe('history', () => {
  it('groups into Hoje, Ontem, Esta semana and Anteriores', () => {
    const groups = groupByPeriod(
      [
        item('2026-10-06T09:41:00'),
        item('2026-10-05T19:40:00'),
        item('2026-10-02T10:00:00'),
        item('2026-09-20T10:00:00'),
      ],
      now,
    )
    expect(groups.map((g) => [g.title, g.items.length])).toEqual([
      ['Hoje', 1],
      ['Ontem', 1],
      ['Esta semana', 1],
      ['Anteriores', 1],
    ])
  })

  it('describes each type as in the prototype', () => {
    expect(itemTitle(item('x'))).toBe('Disse que está lá · Buraco na via')
    expect(itemTitle(item('x', { value: 'no' }))).toBe('Disse que não está lá · Buraco na via')
    expect(
      itemTitle(
        item('x', {
          type: 'incidentReport',
          value: null,
          category: { id: 7, name: 'Roubo', group: 'seguranca', icon: 'roubo' },
        }),
      ),
    ).toBe('Registrou · Roubo (anônimo)')
  })
})
