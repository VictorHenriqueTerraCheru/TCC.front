import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ModoHorario = 'agora' | 'umaHora' | 'outro'

export interface Horario {
  modo: ModoHorario
  outroEm: string | null
}

const MINUTO = 60_000
const PASSO = 15 * MINUTO
export const JANELA_MAXIMA = (23 * 60 + 45) * MINUTO

export function limitesHorario(agora: Date) {
  return { min: agora.getTime() - JANELA_MAXIMA, max: agora.getTime() - MINUTO }
}

export function horarioInicialOutro(agora: Date): Date {
  const { max } = limitesHorario(agora)
  return new Date(Math.floor(max / PASSO) * PASSO)
}

export function passoHorario(atual: Date, direcao: -1 | 1, agora: Date): Date | null {
  const { min, max } = limitesHorario(agora)
  const proximo = atual.getTime() + direcao * PASSO
  return proximo < min || proximo > max ? null : new Date(proximo)
}

export function ocorridoEm(horario: Horario, agora: Date = new Date()): Date {
  const { min, max } = limitesHorario(agora)
  if (horario.modo === 'agora') return new Date(max)
  if (horario.modo === 'umaHora') return new Date(agora.getTime() - 60 * MINUTO)
  const escolhido = horario.outroEm ? Date.parse(horario.outroEm) : max
  return new Date(Math.min(max, Math.max(min, escolhido)))
}

function dia(data: Date): string {
  if (isToday(data)) return 'Hoje'
  if (isYesterday(data)) return 'Ontem'
  return format(data, 'd MMM.', { locale: ptBR })
}

export function descreverHorarioCurto(data: Date): string {
  return `${dia(data)}, por volta das ${format(data, 'HH:mm')}`
}

export function descreverHorario(horario: Horario, agora: Date = new Date()): string {
  const data = ocorridoEm(horario, agora)
  const quando = `${dia(data)}, ${format(data, 'd MMM.', { locale: ptBR })}`
  if (horario.modo === 'agora') return `${quando} · agora`
  return `${quando} · por volta das ${format(data, 'HH:mm')}`
}
