import { differenceInCalendarDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function relativeTime(iso: string, now: Date = new Date()): string {
  const data = new Date(iso)
  const minutes = Math.floor((now.getTime() - data.getTime()) / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = differenceInCalendarDays(now, data)
  if (days <= 30) return days <= 1 ? 'há 1 dia' : `há ${days} dias`
  return format(data, 'd MMM.', { locale: ptBR })
}

export function shortTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function distanceText(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`
  return `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}
