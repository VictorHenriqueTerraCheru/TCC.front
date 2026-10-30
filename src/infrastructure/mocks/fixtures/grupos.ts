import type { Schema } from '../../api'

export const groups: Schema<'GroupResponse'>[] = [
  { key: 'viaPublica', label: 'Via pública', type: 'issue', color: 'orange', sortOrder: 1 },
  { key: 'eletrica', label: 'Elétrica', type: 'issue', color: 'ochre', sortOrder: 2 },
  { key: 'limpeza', label: 'Limpeza', type: 'issue', color: 'brown', sortOrder: 3 },
  { key: 'seguranca', label: 'Segurança', type: 'incident', color: 'red', sortOrder: 4 },
  { key: 'transito', label: 'Trânsito', type: 'incident', color: 'terracotta', sortOrder: 5 },
]
