import type { MaterialSymbol } from 'material-symbols'

export interface NavigationItem {
  route: string
  label: string
  icon: MaterialSymbol
}

export const navigationItems: NavigationItem[] = [
  { route: '/mapa', label: 'Mapa', icon: 'map' },
  { route: '/recentes', label: 'Recentes', icon: 'history' },
  { route: '/perfil', label: 'Perfil', icon: 'person' },
]
