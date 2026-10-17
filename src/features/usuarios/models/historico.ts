import { differenceInCalendarDays, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Schema } from '@/infrastructure/api'

export type ItemHistorico = Schema<'ObterHistoricoItem'>
export type FiltroHistorico = 'tudo' | 'registros' | 'votos'

/** "Confirmou que existe · Buraco na pista" — textos do print 29. */
export function tituloItem({ tipo, valor, categoria }: ItemHistorico): string {
  const acao = {
    registroProblema: 'Registrou',
    registroIncidente: 'Registrou',
    votoExistencia: valor === 'naoVi' ? 'Disse que não viu' : 'Confirmou que existe',
    votoPersistencia:
      valor === 'resolvido' ? 'Respondeu “Foi resolvido”' : 'Respondeu “Sim, continua”',
  }[tipo]
  const anonimo = tipo === 'registroIncidente' ? ' (anônimo)' : ''
  return `${acao} · ${categoria.nome}${anonimo}`
}

/** Hora para hoje/ontem ("09:41"); dia para os mais antigos ("22 set."). */
export function quandoItem(iso: string): string {
  const data = new Date(iso)
  return isToday(data) || isYesterday(data)
    ? format(data, 'HH:mm')
    : format(data, 'd MMM.', { locale: ptBR })
}

/** Versão do resumo no perfil: "hoje, 08:12", "ontem, 19:40", "22 set.". */
export function quandoItemResumo(iso: string): string {
  const data = new Date(iso)
  if (isToday(data)) return `hoje, ${format(data, 'HH:mm')}`
  if (isYesterday(data)) return `ontem, ${format(data, 'HH:mm')}`
  return format(data, 'd MMM.', { locale: ptBR })
}

export interface GrupoHistorico {
  titulo: 'Hoje' | 'Ontem' | 'Esta semana' | 'Anteriores'
  itens: ItemHistorico[]
}

/** Print 29: Hoje / Ontem / Esta semana (até 7 dias) / Anteriores, na ordem da API. */
export function agruparPorPeriodo(
  itens: ItemHistorico[],
  agora: Date = new Date(),
): GrupoHistorico[] {
  const grupos: GrupoHistorico[] = []
  for (const item of itens) {
    const dias = differenceInCalendarDays(agora, new Date(item.data))
    const titulo =
      dias <= 0 ? 'Hoje' : dias === 1 ? 'Ontem' : dias < 7 ? 'Esta semana' : 'Anteriores'
    const ultimo = grupos.at(-1)
    if (ultimo?.titulo === titulo) ultimo.itens.push(item)
    else grupos.push({ titulo, itens: [item] })
  }
  return grupos
}
