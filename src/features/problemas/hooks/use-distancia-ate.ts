import { distanciaMetros, useLocalizacao } from '@/features/localizacao'

/** Acima disso o rodapé verde some (docs/TELAS.md). */
export const DISTANCIA_MAXIMA_RODAPE_M = 2000

/** Distância da última posição conhecida até o ponto, ou null sem permissão (regra 3). */
export function useDistanciaAte(ponto: { lat: number; lng: number }): number | null {
  const { estado, posicao } = useLocalizacao()
  return estado === 'granted' && posicao ? distanciaMetros(posicao, ponto) : null
}
