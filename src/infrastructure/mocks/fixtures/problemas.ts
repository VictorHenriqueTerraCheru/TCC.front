import type { Schema } from '../../api'

type ProblemaNaArea = Schema<'ListarProblemasNaAreaResponse'>

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const problemasNaArea: ProblemaNaArea[] = [
  {
    id: id(1),
    categoriaId: 1,
    lat: -22.905,
    lng: -43.109,
    status: 'ativa',
    confianca: 82,
    faixa: 'alta',
  },
  {
    id: id(2),
    categoriaId: 4,
    lat: -22.9009,
    lng: -43.1136,
    status: 'ativa',
    confianca: 77.5,
    faixa: 'alta',
  },
  {
    id: id(3),
    categoriaId: 5,
    lat: -22.9103,
    lng: -43.1062,
    status: 'ativa',
    confianca: 71,
    faixa: 'alta',
  },
  {
    id: id(4),
    categoriaId: 3,
    lat: -22.9066,
    lng: -43.1051,
    status: 'ativa',
    confianca: 58,
    faixa: 'media',
  },
  {
    id: id(5),
    categoriaId: 6,
    lat: -22.9027,
    lng: -43.1073,
    status: 'possivelmenteResolvida',
    confianca: 58,
    faixa: 'media',
  },
  {
    id: id(6),
    categoriaId: 2,
    lat: -22.9092,
    lng: -43.1028,
    status: 'possivelmenteResolvida',
    confianca: 44,
    faixa: 'media',
  },
  {
    id: id(7),
    categoriaId: 2,
    lat: -22.9007,
    lng: -43.1062,
    status: 'ativa',
    confianca: 31,
    faixa: 'baixa',
  },
  {
    id: id(8),
    categoriaId: 5,
    lat: -22.9059,
    lng: -43.1139,
    status: 'ativa',
    confianca: 25,
    faixa: 'baixa',
  },
  {
    id: id(9),
    categoriaId: 1,
    lat: -22.9079,
    lng: -43.1112,
    status: 'ativa',
    confianca: 28,
    faixa: 'baixa',
  },
  {
    id: id(10),
    categoriaId: 3,
    lat: -22.9038,
    lng: -43.1147,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
  {
    id: id(11),
    categoriaId: 4,
    lat: -22.9063,
    lng: -43.106,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
  {
    id: id(12),
    categoriaId: 2,
    lat: -22.9075,
    lng: -43.1097,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
]

export const calorIncidentes: Schema<'ObterCalorIncidentesResponse'>[] = [
  { lat: -22.903, lng: -43.115, quantidade: 6 },
  { lat: -22.904, lng: -43.114, quantidade: 4 },
  { lat: -22.908, lng: -43.107, quantidade: 9 },
  { lat: -22.909, lng: -43.106, quantidade: 7 },
  { lat: -22.91, lng: -43.108, quantidade: 5 },
  { lat: -22.901, lng: -43.104, quantidade: 3 },
  { lat: -22.9, lng: -43.103, quantidade: 2 },
]

export const grupoDasCelulas = 'seguranca'
