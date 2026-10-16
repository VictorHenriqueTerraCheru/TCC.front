import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** "Quando aconteceu?" (tela 21a). */
export type ModoHorario = 'agora' | 'umaHora' | 'outro'

export interface Horario {
  modo: ModoHorario
  /** Só em "Outro horário": instante escolhido (ISO), em passos de 15 min. */
  outroEm: string | null
}

const MINUTO = 60_000
const PASSO = 15 * MINUTO
/** Regra 16: até 23 h 45 atrás (não 24 h, porque a janela anda enquanto a pessoa preenche). */
export const JANELA_MAXIMA = (23 * 60 + 45) * MINUTO

/** Limites do "Outro horário": de agora − 23 h 45 até agora − 1 min. */
export function limitesHorario(agora: Date) {
  return { min: agora.getTime() - JANELA_MAXIMA, max: agora.getTime() - MINUTO }
}

/** Primeiro valor do "Outro horário": o quarto de hora mais recente que já passou. */
export function horarioInicialOutro(agora: Date): Date {
  const { max } = limitesHorario(agora)
  return new Date(Math.floor(max / PASSO) * PASSO)
}

/** Anda 15 min para trás (−1) ou para frente (+1); null se sair da janela. */
export function passoHorario(atual: Date, direcao: -1 | 1, agora: Date): Date | null {
  const { min, max } = limitesHorario(agora)
  const proximo = atual.getTime() + direcao * PASSO
  return proximo < min || proximo > max ? null : new Date(proximo)
}

/**
 * `ocorridoEm` enviado à API, calculado na hora do envio. A API recusa o futuro sem tolerância:
 * "Agora" vai como agora − 1 min, e o "Outro horário" é trazido de volta para dentro da janela.
 */
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

/** "Hoje, por volta das 08:30" (campo do 21a). */
export function descreverHorarioCurto(data: Date): string {
  return `${dia(data)}, por volta das ${format(data, 'HH:mm')}`
}

/** "Hoje, 26 set. · por volta das 08:30" (resumo do 21b). */
export function descreverHorario(horario: Horario, agora: Date = new Date()): string {
  const data = ocorridoEm(horario, agora)
  const quando = `${dia(data)}, ${format(data, 'd MMM.', { locale: ptBR })}`
  if (horario.modo === 'agora') return `${quando} · agora`
  return `${quando} · por volta das ${format(data, 'HH:mm')}`
}
