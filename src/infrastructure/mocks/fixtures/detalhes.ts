import type { Schema } from '../../api'
import { categories } from './categorias'
import { issuesInArea } from './problemas'

type Detail = Schema<'GetIssueDetailResponse'>

const addresses = [
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

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()

export const AUTHOR_ID = issuesInArea[8]!.id

export function createDetails(): Map<string, Detail> {
  return new Map(
    issuesInArea.map((p, i) => {
      const { type: _type, ...category } = categories.find((c) => c.id === p.categoryId)!
      const base = {
        id: p.id,
        category,
        description: null,
        lat: p.lat,
        lng: p.lng,
        address: addresses[i] ?? 'Rua Voluntários da Pátria, 170 — Botafogo',
        status: p.status,
        trustScore: p.trustScore,
        band: p.band,
        myVote: null,
        isAuthor: false,
      }
      const byStatus: Record<string, Partial<Detail>> = {
        new: {
          createdAt: hoursAgo(0.7),
          evaluation: { voters: 2, required: 5, closesAt: hoursAgo(-70) },
          votes: { yes: 2, no: 0, noLast24h: 0 },
        },
        possiblyResolved: {
          createdAt: hoursAgo(5 * 24 + 3),
          evaluation: null,
          votes: { yes: 12, no: 7, noLast24h: 7 },
        },
        active: {
          createdAt: hoursAgo(2 * 24 + 4),
          evaluation: null,
          votes: { yes: 15, no: 1, noLast24h: 1 },
        },
      }
      return [p.id, { ...base, ...byStatus[p.status] } as Detail]
    }),
  )
}
