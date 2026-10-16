import type { Schema } from '../../api'

type ProblemaNaArea = Schema<'ListarProblemasNaAreaResponse'>

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

// Botafogo, espalhados como nos prints 1, 2 e 24 (todas as faixas e estados).
export const problemasNaArea: ProblemaNaArea[] = [
  {
    id: id(1),
    categoriaId: 1,
    lat: -22.9519,
    lng: -43.1866,
    status: 'ativa',
    confianca: 82,
    faixa: 'alta',
  },
  {
    id: id(2),
    categoriaId: 4,
    lat: -22.9478,
    lng: -43.1912,
    status: 'ativa',
    confianca: 77.5,
    faixa: 'alta',
  },
  {
    id: id(3),
    categoriaId: 5,
    lat: -22.9572,
    lng: -43.1838,
    status: 'ativa',
    confianca: 71,
    faixa: 'alta',
  },
  {
    id: id(4),
    categoriaId: 3,
    lat: -22.9535,
    lng: -43.1827,
    status: 'ativa',
    confianca: 58,
    faixa: 'media',
  },
  {
    id: id(5),
    categoriaId: 6,
    lat: -22.9496,
    lng: -43.1849,
    status: 'possivelmenteResolvida',
    confianca: 58,
    faixa: 'media',
  },
  {
    id: id(6),
    categoriaId: 2,
    lat: -22.9561,
    lng: -43.1804,
    status: 'possivelmenteResolvida',
    confianca: 44,
    faixa: 'media',
  },
  {
    id: id(7),
    categoriaId: 2,
    lat: -22.9476,
    lng: -43.1838,
    status: 'ativa',
    confianca: 31,
    faixa: 'baixa',
  },
  {
    id: id(8),
    categoriaId: 5,
    lat: -22.9528,
    lng: -43.1915,
    status: 'ativa',
    confianca: 25,
    faixa: 'baixa',
  },
  {
    id: id(9),
    categoriaId: 1,
    lat: -22.9548,
    lng: -43.1888,
    status: 'ativa',
    confianca: 28,
    faixa: 'baixa',
  },
  {
    id: id(10),
    categoriaId: 3,
    lat: -22.9507,
    lng: -43.1923,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
  {
    id: id(11),
    categoriaId: 4,
    lat: -22.9532,
    lng: -43.184,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
  {
    id: id(12),
    categoriaId: 2,
    lat: -22.9544,
    lng: -43.1873,
    status: 'nova',
    confianca: null,
    faixa: null,
  },
]

// Incidentes agregados (pontos já arredondados em 3 casas, como a API grava).
export const calorIncidentes: Schema<'ObterCalorIncidentesResponse'>[] = [
  { lat: -22.95, lng: -43.193, quantidade: 6 },
  { lat: -22.951, lng: -43.192, quantidade: 4 },
  { lat: -22.955, lng: -43.185, quantidade: 9 },
  { lat: -22.956, lng: -43.184, quantidade: 7 },
  { lat: -22.957, lng: -43.186, quantidade: 5 },
  { lat: -22.948, lng: -43.182, quantidade: 3 },
  { lat: -22.947, lng: -43.181, quantidade: 2 },
]

/** Grupo de incidente de cada célula (para o filtro do mock): só roubo em Botafogo. */
export const grupoDasCelulas = 'seguranca'
