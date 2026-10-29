import type { Schema } from '../../api'

export const categorias: Schema<'ListarCategoriasResponse'>[] = [
  { id: 1, nome: 'Buraco na via', grupo: 'viaPublica', tipo: 'problema', icone: 'buraco' },
  { id: 2, nome: 'Calçada danificada', grupo: 'viaPublica', tipo: 'problema', icone: 'calcada' },
  { id: 3, nome: 'Poste apagado', grupo: 'eletrica', tipo: 'problema', icone: 'poste' },
  { id: 4, nome: 'Fio caído', grupo: 'eletrica', tipo: 'problema', icone: 'fio' },
  { id: 5, nome: 'Descarte irregular', grupo: 'limpeza', tipo: 'problema', icone: 'descarte' },
  { id: 6, nome: 'Lixo acumulado', grupo: 'limpeza', tipo: 'problema', icone: 'lixo' },
  { id: 7, nome: 'Roubo', grupo: 'seguranca', tipo: 'incidente', icone: 'roubo' },
  { id: 8, nome: 'Acidente de trânsito', grupo: 'transito', tipo: 'incidente', icone: 'acidente' },
]
