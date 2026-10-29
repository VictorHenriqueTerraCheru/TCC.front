import type { MaterialSymbol } from 'material-symbols'

import type { Schema } from '@/infrastructure/api'

export type Me = Schema<'GetMeResponse'>
export type Perfil = Schema<'Role'>

export const aparenciaPerfil: Record<Perfil, { label: string; icon: MaterialSymbol }> = {
  citizen: { label: 'Cidadão', icon: 'person' },
  verifiedCitizen: { label: 'Perfil verificado', icon: 'verified' },
  administrator: { label: 'Administrador', icon: 'admin_panel_settings' },
}

export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join('')
}
