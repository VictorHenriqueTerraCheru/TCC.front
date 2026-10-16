import type { MaterialSymbol } from 'material-symbols'

export interface ItemNavegacao {
  rota: string
  rotulo: string
  icone: MaterialSymbol
}

// Mesmos três destinos na barra inferior (mobile) e no trilho (desktop).
export const itensNavegacao: ItemNavegacao[] = [
  { rota: '/mapa', rotulo: 'Mapa', icone: 'map' },
  { rota: '/recentes', rotulo: 'Recentes', icone: 'history' },
  { rota: '/perfil', rotulo: 'Perfil', icone: 'person' },
]
