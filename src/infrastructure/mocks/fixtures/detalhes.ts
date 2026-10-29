import type { Schema } from '../../api'
import { categorias } from './categorias'
import { problemasNaArea } from './problemas'

type Detalhe = Schema<'GetIssueDetailResponse'>

const enderecos = [
  'Rua Voluntários da Pátria, 190 — Botafogo',
  'Rua Sorocaba, 120 — Botafogo',
  'Rua Paulo Barreto, 45 — Botafogo',
  'Rua Dona Mariana, 48 — Botafogo',
  'Rua Marquês de Olinda, 12 — Botafogo',
  'Rua da Passagem, 78 — Botafogo',
  'Rua Real Grandeza, 210 — Botafogo',
  'Rua São Clemente, 300 — Botafogo',
  'Rua General Polidoro, 90 — Botafogo',
  'Rua Mena Barreto, 33 — Botafogo',
  'Rua Sorocaba, 120 — Botafogo',
  'Rua Paulino Fernandes, 15 — Botafogo',
]

const horasAtras = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString()

export const ID_DO_AUTOR = problemasNaArea[8]!.id

export function criarDetalhes(): Map<string, Detalhe> {
  return new Map(
    problemasNaArea.map((p, i) => {
      const { type: _tipo, ...categoria } = categorias.find((c) => c.id === p.categoryId)!
      const base = {
        id: p.id,
        category: categoria,
        description: null,
        lat: p.lat,
        lng: p.lng,
        address: enderecos[i] ?? 'Rua Voluntários da Pátria, 170 — Botafogo',
        status: p.status,
        trustScore: p.trustScore,
        band: p.band,
        myVote: null,
        isAuthor: false,
      }
      const porStatus: Record<string, Partial<Detalhe>> = {
        new: {
          createdAt: horasAtras(0.7),
          evaluation: { voters: 2, required: 5, closesAt: horasAtras(-70) },
          votes: { yes: 2, no: 0, noLast24h: 0 },
        },
        possiblyResolved: {
          createdAt: horasAtras(5 * 24 + 3),
          evaluation: null,
          votes: { yes: 12, no: 7, noLast24h: 7 },
        },
        active: {
          createdAt: horasAtras(2 * 24 + 4),
          evaluation: null,
          votes: { yes: 15, no: 1, noLast24h: 1 },
        },
      }
      return [p.id, { ...base, ...porStatus[p.status] } as Detalhe]
    }),
  )
}
