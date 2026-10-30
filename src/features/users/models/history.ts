import { differenceInCalendarDays, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { Schema } from '@/infrastructure/api'

export type HistoryItem = Schema<'GetHistoryItem'>
export type HistoryFilter = 'all' | 'reports' | 'votes'

export function itemTitle({ type, value, category }: HistoryItem): string {
  const action = {
    issueReport: 'Registrou',
    incidentReport: 'Registrou',
    vote: value === 'no' ? 'Disse que não está lá' : 'Disse que está lá',
  }[type]
  const anonymous = type === 'incidentReport' ? ' (anônimo)' : ''
  return `${action} · ${category.name}${anonymous}`
}

export function itemTime(iso: string): string {
  const data = new Date(iso)
  return isToday(data) || isYesterday(data)
    ? format(data, 'HH:mm')
    : format(data, 'd MMM.', { locale: ptBR })
}

export function itemTimeShort(iso: string): string {
  const data = new Date(iso)
  if (isToday(data)) return `hoje, ${format(data, 'HH:mm')}`
  if (isYesterday(data)) return `ontem, ${format(data, 'HH:mm')}`
  return format(data, 'd MMM.', { locale: ptBR })
}

export interface HistoryGroup {
  title: 'Hoje' | 'Ontem' | 'Esta semana' | 'Anteriores'
  items: HistoryItem[]
}

export function groupByPeriod(items: HistoryItem[], now: Date = new Date()): HistoryGroup[] {
  const groups: HistoryGroup[] = []
  for (const item of items) {
    const days = differenceInCalendarDays(now, new Date(item.date))
    const title =
      days <= 0 ? 'Hoje' : days === 1 ? 'Ontem' : days < 7 ? 'Esta semana' : 'Anteriores'
    const last = groups.at(-1)
    if (last?.title === title) last.items.push(item)
    else groups.push({ title, items: [item] })
  }
  return groups
}
