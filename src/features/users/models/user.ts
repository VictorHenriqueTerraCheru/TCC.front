import type { MaterialSymbol } from 'material-symbols'

import type { Schema } from '@/infrastructure/api'

export type Me = Schema<'GetMeResponse'>
export type Role = Schema<'Role'>

export const roleAppearance: Record<Role, { label: string; icon: MaterialSymbol }> = {
  citizen: { label: 'Cidadão', icon: 'person' },
  verifiedCitizen: { label: 'Perfil verificado', icon: 'verified' },
  administrator: { label: 'Administrador', icon: 'admin_panel_settings' },
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
