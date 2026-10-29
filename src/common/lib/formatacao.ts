import { differenceInCalendarDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function tempoRelativo(iso: string, agora: Date = new Date()): string {
  const data = new Date(iso)
  const minutos = Math.floor((agora.getTime() - data.getTime()) / 60_000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = differenceInCalendarDays(agora, data)
  if (dias <= 30) return dias <= 1 ? 'há 1 dia' : `há ${dias} dias`
  return format(data, 'd MMM.', { locale: ptBR })
}

export function horaCurta(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function distanciaTexto(metros: number): string {
  if (metros < 1000) return `${Math.max(10, Math.round(metros / 10) * 10)} m`
  return `${(metros / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}
