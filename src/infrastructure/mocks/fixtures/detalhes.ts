import type { Schema } from '../../api'
import { categorias } from './categorias'
import { problemasNaArea } from './problemas'

type Detalhe = Schema<'ObterDetalheProblemaResponse'>

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

/** Problema registrado pelo próprio usuário logado no mock (para o estado souAutor). */
export const ID_DO_AUTOR = problemasNaArea[8]!.id

/** Detalhes coerentes com os marcadores; os três primeiros de cada status imitam as telas 3, 22 e 23. */
export function criarDetalhes(): Map<string, Detalhe> {
  return new Map(
    problemasNaArea.map((p, i) => {
      const { tipo, ...categoria } = categorias.find((c) => c.id === p.categoriaId)!
      const base = {
        id: p.id,
        categoria,
        descricao: null,
        lat: p.lat,
        lng: p.lng,
        endereco: enderecos[i] ?? 'Rua Voluntários da Pátria, 170 — Botafogo',
        status: p.status,
        confianca: p.confianca,
        faixa: p.faixa,
        meusVotos: null,
        souAutor: false,
      }
      const porStatus: Record<string, Partial<Detalhe>> = {
        nova: {
          criadoEm: horasAtras(0.7),
          avaliacao: { votantes: 2, necessarios: 5, encerraEm: horasAtras(-70) },
          existencia: { confirmacoes: 2, naoVi: 0 },
          persistencia: { continua: 0, resolvido: 0, resolvidoUltimas24h: 0 },
        },
        possivelmenteResolvida: {
          criadoEm: horasAtras(5 * 24 + 3),
          avaliacao: null,
          existencia: { confirmacoes: 12, naoVi: 0 },
          persistencia: { continua: 2, resolvido: 7, resolvidoUltimas24h: 7 },
        },
        ativa: {
          criadoEm: horasAtras(2 * 24 + 4),
          avaliacao: null,
          existencia: { confirmacoes: 15, naoVi: 1 },
          persistencia: { continua: 9, resolvido: 1, resolvidoUltimas24h: 1 },
        },
      }
      return [p.id, { ...base, ...porStatus[p.status] } as Detalhe]
    }),
  )
}
