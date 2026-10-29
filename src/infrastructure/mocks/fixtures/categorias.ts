import type { Schema } from '../../api'

export const categorias: Schema<'ListCategoriesResponse'>[] = [
  { id: 1, name: 'Buraco na via', group: 'viaPublica', type: 'issue', icon: 'buraco' },
  { id: 2, name: 'Calçada danificada', group: 'viaPublica', type: 'issue', icon: 'calcada' },
  { id: 3, name: 'Poste apagado', group: 'eletrica', type: 'issue', icon: 'poste' },
  { id: 4, name: 'Fio caído', group: 'eletrica', type: 'issue', icon: 'fio' },
  { id: 5, name: 'Descarte irregular', group: 'limpeza', type: 'issue', icon: 'descarte' },
  { id: 6, name: 'Lixo acumulado', group: 'limpeza', type: 'issue', icon: 'lixo' },
  { id: 7, name: 'Roubo', group: 'seguranca', type: 'incident', icon: 'roubo' },
  { id: 8, name: 'Acidente de trânsito', group: 'transito', type: 'incident', icon: 'acidente' },
]
