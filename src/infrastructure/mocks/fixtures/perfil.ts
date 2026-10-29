import type { Schema } from '../../api'
import { categorias } from './categorias'
import { problemasNaArea } from './problemas'

type ItemHistorico = Schema<'ObterHistoricoItem'>
type Verificacao = Schema<'ListarVerificacoesItem'>

const categoria = (id: number) => {
  const { tipo: _tipo, ...resumo } = categorias.find((c) => c.id === id)!
  return resumo
}
const horasAtras = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString()

export function historicoInicial(): ItemHistorico[] {
  return [
    {
      tipo: 'registroProblema',
      ocorrenciaId: problemasNaArea[11]!.id,
      categoria: categoria(1),
      endereco: 'Rua Voluntários da Pátria, 170',
      valor: null,
      statusProblema: 'nova',
      data: horasAtras(0.5),
    },
    {
      tipo: 'voto',
      ocorrenciaId: problemasNaArea[0]!.id,
      categoria: categoria(1),
      endereco: 'Rua Voluntários da Pátria',
      valor: 'sim',
      statusProblema: 'ativa',
      data: horasAtras(2),
    },
    {
      tipo: 'registroProblema',
      ocorrenciaId: problemasNaArea[3]!.id,
      categoria: categoria(3),
      endereco: 'Rua Dona Mariana, 48',
      valor: null,
      statusProblema: 'ativa',
      data: horasAtras(26),
    },
    {
      tipo: 'voto',
      ocorrenciaId: problemasNaArea[1]!.id,
      categoria: categoria(4),
      endereco: 'Rua Sorocaba',
      valor: 'sim',
      statusProblema: 'ativa',
      data: horasAtras(28),
    },
    {
      tipo: 'voto',
      ocorrenciaId: problemasNaArea[2]!.id,
      categoria: categoria(5),
      endereco: 'Rua Marquês de Abrantes',
      valor: 'nao',
      statusProblema: 'ativa',
      data: horasAtras(4 * 24),
    },
    {
      tipo: 'registroProblema',
      ocorrenciaId: problemasNaArea[4]!.id,
      categoria: categoria(6),
      endereco: 'Rua Gavião Peixoto, Niterói',
      valor: null,
      statusProblema: 'resolvida',
      data: horasAtras(5 * 24),
    },
    {
      tipo: 'registroIncidente',
      ocorrenciaId: null,
      categoria: categoria(7),
      endereco: 'Entorno da Praia de Botafogo',
      valor: null,
      statusProblema: null,
      data: horasAtras(6 * 24),
    },
    {
      tipo: 'voto',
      ocorrenciaId: problemasNaArea[5]!.id,
      categoria: categoria(2),
      endereco: 'Av. Roberto Silveira, 310 — Icaraí',
      valor: 'sim',
      statusProblema: 'possivelmenteResolvida',
      data: horasAtras(12 * 24),
    },
  ]
}

export function verificacoesIniciais(): Verificacao[] {
  return [
    {
      id: 'v-1',
      usuario: { id: 'u-carlos', nome: 'Carlos Menezes', iniciais: 'CM' },
      tipoVinculo: 'moradorRegiao',
      justificativa:
        'Sou síndico de um prédio na Rua São Clemente e acompanho todo dia a iluminação e as calçadas do quarteirão.',
      status: 'pendente',
      criadaEm: horasAtras(30),
      motivoRecusa: null,
    },
    {
      id: 'v-2',
      usuario: { id: 'u-juliana', nome: 'Juliana Prado', iniciais: 'JP' },
      tipoVinculo: 'servidorPublico',
      justificativa:
        'Sou agente de trânsito em Niterói, na região de Icaraí, e registro ocorrências durante as rondas.',
      status: 'pendente',
      criadaEm: horasAtras(26),
      motivoRecusa: null,
    },
    {
      id: 'v-3',
      usuario: { id: 'u-rafael', nome: 'Rafael Duarte', iniciais: 'RD' },
      tipoVinculo: 'moradorRegiao',
      justificativa: 'Moro no Flamengo há muitos anos e conheço bem a região.',
      status: 'pendente',
      criadaEm: horasAtras(20),
      motivoRecusa: null,
    },
    {
      id: 'v-4',
      usuario: { id: 'u-verificado', nome: 'Mariana Souza', iniciais: 'MS' },
      tipoVinculo: 'moradorRegiao',
      justificativa: 'Moro em Botafogo e passo pelas ruas do bairro todos os dias a pé.',
      status: 'aprovada',
      criadaEm: horasAtras(21 * 24),
      motivoRecusa: null,
    },
    {
      id: 'v-5',
      usuario: { id: 'u-pedro', nome: 'Pedro Alves', iniciais: 'PA' },
      tipoVinculo: 'outro',
      justificativa: 'Quero ajudar a cidade e tenho interesse em urbanismo.',
      status: 'recusada',
      criadaEm: horasAtras(15 * 24),
      motivoRecusa: 'A justificativa não mostra vínculo com a região.',
    },
  ]
}
