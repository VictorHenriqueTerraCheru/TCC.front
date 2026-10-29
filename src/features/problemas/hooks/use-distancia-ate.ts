import { distanciaMetros, useLocalizacao } from '@/features/localizacao'

export const DISTANCIA_MAXIMA_RODAPE_M = 2000

export function useDistanciaAte(ponto: { lat: number; lng: number }): number | null {
  const { estado, posicao } = useLocalizacao()
  return estado === 'granted' && posicao ? distanciaMetros(posicao, ponto) : null
}
