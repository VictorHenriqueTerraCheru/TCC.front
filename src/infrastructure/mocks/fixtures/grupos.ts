import type { Schema } from '../../api'

export const grupos: Schema<'GrupoResponse'>[] = [
  { chave: 'viaPublica', rotulo: 'Via pública', tipo: 'problema', cor: 'laranja', ordem: 1 },
  { chave: 'eletrica', rotulo: 'Elétrica', tipo: 'problema', cor: 'ocre', ordem: 2 },
  { chave: 'limpeza', rotulo: 'Limpeza', tipo: 'problema', cor: 'marrom', ordem: 3 },
  { chave: 'seguranca', rotulo: 'Segurança', tipo: 'incidente', cor: 'vermelho', ordem: 4 },
  { chave: 'transito', rotulo: 'Trânsito', tipo: 'incidente', cor: 'terracota', ordem: 5 },
]
