import type { MaterialSymbol } from 'material-symbols'

import type { Schema } from '@/infrastructure/api'

export type Me = Schema<'ObterMeResponse'>
export type Perfil = Schema<'Perfil'>

export const aparenciaPerfil: Record<Perfil, { rotulo: string; icone: MaterialSymbol }> = {
  cidadao: { rotulo: 'Cidadão', icone: 'person' },
  cidadaoVerificado: { rotulo: 'Perfil verificado', icone: 'verified' },
  administrador: { rotulo: 'Administrador', icone: 'admin_panel_settings' },
}

/** "Mariana Souza" → "MS". */
export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join('')
}
