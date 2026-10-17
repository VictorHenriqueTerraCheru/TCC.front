import type { ItemHistorico } from './historico'
import { agruparPorPeriodo, tituloItem } from './historico'

const agora = new Date('2026-10-06T12:00:00')
const item = (data: string, extra: Partial<ItemHistorico> = {}) =>
  ({
    tipo: 'votoExistencia',
    valor: 'confirma',
    categoria: { id: 1, nome: 'Buraco na via', grupo: 'viaPublica', icone: 'buraco' },
    data,
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
    expect(grupos.map((g) => [g.titulo, g.itens.length])).toEqual([
      ['Hoje', 1],
      ['Ontem', 1],
      ['Esta semana', 1],
      ['Anteriores', 1],
    ])
  })

  it('descreve cada tipo como no protótipo', () => {
    expect(tituloItem(item('x'))).toBe('Confirmou que existe · Buraco na via')
    expect(tituloItem(item('x', { tipo: 'votoPersistencia', valor: 'resolvido' }))).toBe(
      'Respondeu “Foi resolvido” · Buraco na via',
    )
    expect(
      tituloItem(
        item('x', {
          tipo: 'registroIncidente',
          valor: null,
          categoria: { id: 7, nome: 'Roubo', grupo: 'seguranca', icone: 'roubo' },
        }),
      ),
    ).toBe('Registrou · Roubo (anônimo)')
  })
})
