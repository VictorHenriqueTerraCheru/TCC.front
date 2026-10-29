import type { ItemHistorico } from './historico'
import { agruparPorPeriodo, tituloItem } from './historico'

const agora = new Date('2026-10-06T12:00:00')
const item = (data: string, extra: Partial<ItemHistorico> = {}) =>
  ({
    type: 'vote',
    value: 'yes',
    category: { id: 1, name: 'Buraco na via', group: 'viaPublica', icon: 'buraco' },
    date: data,
    ...extra,
  }) as ItemHistorico

describe('histórico', () => {
  it('agrupa em Hoje, Ontem, Esta semana e Anteriores', () => {
    const grupos = agruparPorPeriodo(
      [
        item('2026-10-06T09:41:00'),
        item('2026-10-05T19:40:00'),
        item('2026-10-02T10:00:00'),
        item('2026-09-20T10:00:00'),
      ],
      agora,
    )
    expect(grupos.map((g) => [g.titulo, g.items.length])).toEqual([
      ['Hoje', 1],
      ['Ontem', 1],
      ['Esta semana', 1],
      ['Anteriores', 1],
    ])
  })

  it('descreve cada tipo como no protótipo', () => {
    expect(tituloItem(item('x'))).toBe('Disse que está lá · Buraco na via')
    expect(tituloItem(item('x', { value: 'no' }))).toBe('Disse que não está lá · Buraco na via')
    expect(
      tituloItem(
        item('x', {
          type: 'incidentReport',
          value: null,
          category: { id: 7, name: 'Roubo', group: 'seguranca', icon: 'roubo' },
        }),
      ),
    ).toBe('Registrou · Roubo (anônimo)')
  })
})
