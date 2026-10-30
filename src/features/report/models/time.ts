import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type TimeMode = 'now' | 'oneHour' | 'other'

export interface OccurrenceTime {
  mode: TimeMode
  otherAt: string | null
}

const MINUTE = 60_000
const STEP = 15 * MINUTE
export const MAX_WINDOW = (23 * 60 + 45) * MINUTE

export function timeBounds(now: Date) {
  return { min: now.getTime() - MAX_WINDOW, max: now.getTime() - MINUTE }
}

export function initialOtherTime(now: Date): Date {
  const { max } = timeBounds(now)
  return new Date(Math.floor(max / STEP) * STEP)
}

export function timeStep(current: Date, direction: -1 | 1, now: Date): Date | null {
  const { min, max } = timeBounds(now)
  const next = current.getTime() + direction * STEP
  return next < min || next > max ? null : new Date(next)
}

export function occurredAt(time: OccurrenceTime, now: Date = new Date()): Date {
  const { min, max } = timeBounds(now)
  if (time.mode === 'now') return new Date(max)
  if (time.mode === 'oneHour') return new Date(now.getTime() - 60 * MINUTE)
  const chosen = time.otherAt ? Date.parse(time.otherAt) : max
  return new Date(Math.min(max, Math.max(min, chosen)))
}

function day(data: Date): string {
  if (isToday(data)) return 'Hoje'
  if (isYesterday(data)) return 'Ontem'
  return format(data, 'd MMM.', { locale: ptBR })
}

export function describeTimeShort(data: Date): string {
  return `${day(data)}, por volta das ${format(data, 'HH:mm')}`
}

export function describeTime(time: OccurrenceTime, now: Date = new Date()): string {
  const data = occurredAt(time, now)
  const when = `${day(data)}, ${format(data, 'd MMM.', { locale: ptBR })}`
  if (time.mode === 'now') return `${when} · agora`
  return `${when} · por volta das ${format(data, 'HH:mm')}`
}
