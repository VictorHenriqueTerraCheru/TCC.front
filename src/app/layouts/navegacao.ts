import type { MaterialSymbol } from 'material-symbols'

export interface ItemNavegacao {
  rota: string
  label: string
  icon: MaterialSymbol
}

export const itensNavegacao: ItemNavegacao[] = [
  { rota: '/mapa', label: 'Mapa', icon: 'map' },
  { rota: '/recentes', label: 'Recentes', icon: 'history' },
  { rota: '/perfil', label: 'Perfil', icon: 'person' },
]
