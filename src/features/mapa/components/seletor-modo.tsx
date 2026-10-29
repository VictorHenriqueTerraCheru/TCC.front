import { Segmentado } from '@/common/components/segmentado'

import { modosMapa, type ModoMapa } from '../models/filtros'

interface SeletorModoProps {
  modo: ModoMapa
  aoMudar(modo: ModoMapa): void
}

export function SeletorModo({ modo, aoMudar }: SeletorModoProps) {
  return (
    <Segmentado
      rotulo="O que mostrar no mapa"
      opcoes={modosMapa}
      valor={modo}
      aoMudar={aoMudar}
      className="pointer-events-auto shadow-1 lg:max-w-[440px]"
    />
  )
}
