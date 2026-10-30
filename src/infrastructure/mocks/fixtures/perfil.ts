import type { Schema } from '../../api'
import { categories } from './categorias'
import { issuesInArea } from './problemas'

type HistoryItem = Schema<'GetHistoryItem'>
type Verification = Schema<'ListVerificationsItem'>

const category = (id: number) => {
  const { type: _type, ...summary } = categories.find((c) => c.id === id)!
  return summary
}
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()

export function initialHistory(): HistoryItem[] {
  return [
    {
      type: 'issueReport',
      reportId: issuesInArea[11]!.id,
      category: category(1),
      address: 'Rua Voluntários da Pátria, 170',
      value: null,
      issueStatus: 'new',
      date: hoursAgo(0.5),
    },
    {
      type: 'vote',
      reportId: issuesInArea[0]!.id,
      category: category(1),
      address: 'Rua Voluntários da Pátria',
      value: 'yes',
      issueStatus: 'active',
      date: hoursAgo(2),
    },
    {
      type: 'issueReport',
      reportId: issuesInArea[3]!.id,
      category: category(3),
      address: 'Rua Dona Mariana, 48',
      value: null,
      issueStatus: 'active',
      date: hoursAgo(26),
    },
    {
      type: 'vote',
      reportId: issuesInArea[1]!.id,
      category: category(4),
      address: 'Rua Sorocaba',
      value: 'yes',
      issueStatus: 'active',
      date: hoursAgo(28),
    },
    {
      type: 'vote',
      reportId: issuesInArea[2]!.id,
      category: category(5),
      address: 'Rua Marquês de Abrantes',
      value: 'no',
      issueStatus: 'active',
      date: hoursAgo(4 * 24),
    },
    {
      type: 'issueReport',
      reportId: issuesInArea[4]!.id,
      category: category(6),
      address: 'Rua Gavião Peixoto, Niterói',
      value: null,
      issueStatus: 'resolved',
      date: hoursAgo(5 * 24),
    },
    {
      type: 'incidentReport',
      reportId: null,
      category: category(7),
      address: 'Entorno da Praia de Botafogo',
      value: null,
      issueStatus: null,
      date: hoursAgo(6 * 24),
    },
    {
      type: 'vote',
      reportId: issuesInArea[5]!.id,
      category: category(2),
      address: 'Av. Roberto Silveira, 310 — Icaraí',
      value: 'yes',
      issueStatus: 'possiblyResolved',
      date: hoursAgo(12 * 24),
    },
  ]
}

export function initialVerifications(): Verification[] {
  return [
    {
      id: 'v-1',
      user: { id: 'u-carlos', name: 'Carlos Menezes', initials: 'CM' },
      affiliationType: 'livesInArea',
      justification:
        'Sou síndico de um prédio na Rua São Clemente e acompanho todo dia a iluminação e as calçadas do quarteirão.',
      status: 'pending',
      createdAt: hoursAgo(30),
      rejectionReason: null,
    },
    {
      id: 'v-2',
      user: { id: 'u-juliana', name: 'Juliana Prado', initials: 'JP' },
      affiliationType: 'publicServant',
      justification:
        'Sou agente de trânsito em Niterói, na região de Icaraí, e registro ocorrências durante as rondas.',
      status: 'pending',
      createdAt: hoursAgo(26),
      rejectionReason: null,
    },
    {
      id: 'v-3',
      user: { id: 'u-rafael', name: 'Rafael Duarte', initials: 'RD' },
      affiliationType: 'livesInArea',
      justification: 'Moro no Flamengo há muitos anos e conheço bem a região.',
      status: 'pending',
      createdAt: hoursAgo(20),
      rejectionReason: null,
    },
    {
      id: 'v-4',
      user: { id: 'u-verified', name: 'Mariana Souza', initials: 'MS' },
      affiliationType: 'livesInArea',
      justification: 'Moro em Botafogo e passo pelas ruas do bairro todos os dias a pé.',
      status: 'approved',
      createdAt: hoursAgo(21 * 24),
      rejectionReason: null,
    },
    {
      id: 'v-5',
      user: { id: 'u-pedro', name: 'Pedro Alves', initials: 'PA' },
      affiliationType: 'other',
      justification: 'Quero ajudar a cidade e tenho interesse em urbanismo.',
      status: 'rejected',
      createdAt: hoursAgo(15 * 24),
      rejectionReason: 'A justificativa não mostra vínculo com a região.',
    },
  ]
}
