import type { MaterialSymbol } from 'material-symbols'

export interface NavigationItem {
  route: string
  label: string
  icon: MaterialSymbol
}

export const navigationItems: NavigationItem[] = [
  { route: '/map', label: 'Mapa', icon: 'map' },
  { route: '/recent', label: 'Recentes', icon: 'history' },
  { route: '/profile', label: 'Perfil', icon: 'person' },
]
