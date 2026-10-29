import type { Schema } from '../../api'
import { categorias } from './categorias'
import { problemasNaArea } from './problemas'

type ItemHistorico = Schema<'GetHistoryItem'>
type Verificacao = Schema<'ListVerificationsItem'>

const categoria = (id: number) => {
  const { type: _tipo, ...resumo } = categorias.find((c) => c.id === id)!
  return resumo
}
const horasAtras = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString()

export function historicoInicial(): ItemHistorico[] {
  return [
    {
      type: 'issueReport',
      reportId: problemasNaArea[11]!.id,
      category: categoria(1),
      address: 'Rua Voluntários da Pátria, 170',
      value: null,
      issueStatus: 'new',
      date: horasAtras(0.5),
    },
    {
      type: 'vote',
      reportId: problemasNaArea[0]!.id,
      category: categoria(1),
      address: 'Rua Voluntários da Pátria',
      value: 'yes',
      issueStatus: 'active',
      date: horasAtras(2),
    },
    {
      type: 'issueReport',
      reportId: problemasNaArea[3]!.id,
      category: categoria(3),
      address: 'Rua Dona Mariana, 48',
      value: null,
      issueStatus: 'active',
      date: horasAtras(26),
    },
    {
      type: 'vote',
      reportId: problemasNaArea[1]!.id,
      category: categoria(4),
      address: 'Rua Sorocaba',
      value: 'yes',
      issueStatus: 'active',
      date: horasAtras(28),
    },
    {
      type: 'vote',
      reportId: problemasNaArea[2]!.id,
      category: categoria(5),
      address: 'Rua Marquês de Abrantes',
      value: 'no',
      issueStatus: 'active',
      date: horasAtras(4 * 24),
    },
    {
      type: 'issueReport',
      reportId: problemasNaArea[4]!.id,
      category: categoria(6),
      address: 'Rua Gavião Peixoto, Niterói',
      value: null,
      issueStatus: 'resolved',
      date: horasAtras(5 * 24),
    },
    {
      type: 'incidentReport',
      reportId: null,
      category: categoria(7),
      address: 'Entorno da Praia de Botafogo',
      value: null,
      issueStatus: null,
      date: horasAtras(6 * 24),
    },
    {
      type: 'vote',
      reportId: problemasNaArea[5]!.id,
      category: categoria(2),
      address: 'Av. Roberto Silveira, 310 — Icaraí',
      value: 'yes',
      issueStatus: 'possiblyResolved',
      date: horasAtras(12 * 24),
    },
  ]
}

export function verificacoesIniciais(): Verificacao[] {
  return [
    {
      id: 'v-1',
      user: { id: 'u-carlos', name: 'Carlos Menezes', initials: 'CM' },
      affiliationType: 'livesInArea',
      justification:
        'Sou síndico de um prédio na Rua São Clemente e acompanho todo dia a iluminação e as calçadas do quarteirão.',
      status: 'pending',
      createdAt: horasAtras(30),
      rejectionReason: null,
    },
    {
      id: 'v-2',
      user: { id: 'u-juliana', name: 'Juliana Prado', initials: 'JP' },
      affiliationType: 'publicServant',
      justification:
        'Sou agente de trânsito em Niterói, na região de Icaraí, e registro ocorrências durante as rondas.',
      status: 'pending',
      createdAt: horasAtras(26),
      rejectionReason: null,
    },
    {
      id: 'v-3',
      user: { id: 'u-rafael', name: 'Rafael Duarte', initials: 'RD' },
      affiliationType: 'livesInArea',
      justification: 'Moro no Flamengo há muitos anos e conheço bem a região.',
      status: 'pending',
      createdAt: horasAtras(20),
      rejectionReason: null,
    },
    {
      id: 'v-4',
      user: { id: 'u-verificado', name: 'Mariana Souza', initials: 'MS' },
      affiliationType: 'livesInArea',
      justification: 'Moro em Botafogo e passo pelas ruas do bairro todos os dias a pé.',
      status: 'approved',
      createdAt: horasAtras(21 * 24),
      rejectionReason: null,
    },
    {
      id: 'v-5',
      user: { id: 'u-pedro', name: 'Pedro Alves', initials: 'PA' },
      affiliationType: 'other',
      justification: 'Quero ajudar a cidade e tenho interesse em urbanismo.',
      status: 'rejected',
      createdAt: horasAtras(15 * 24),
      rejectionReason: 'A justificativa não mostra vínculo com a região.',
    },
  ]
}
