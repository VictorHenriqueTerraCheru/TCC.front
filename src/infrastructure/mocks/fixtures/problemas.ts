import type { Schema } from '../../api'

type IssueInArea = Schema<'ListIssuesInAreaResponse'>

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const issuesInArea: IssueInArea[] = [
  {
    id: id(1),
    categoryId: 1,
    lat: -22.905,
    lng: -43.109,
    status: 'active',
    trustScore: 82,
    band: 'high',
  },
  {
    id: id(2),
    categoryId: 4,
    lat: -22.9009,
    lng: -43.1136,
    status: 'active',
    trustScore: 77.5,
    band: 'high',
  },
  {
    id: id(3),
    categoryId: 5,
    lat: -22.9103,
    lng: -43.1062,
    status: 'active',
    trustScore: 71,
    band: 'high',
  },
  {
    id: id(4),
    categoryId: 3,
    lat: -22.9066,
    lng: -43.1051,
    status: 'active',
    trustScore: 58,
    band: 'medium',
  },
  {
    id: id(5),
    categoryId: 6,
    lat: -22.9027,
    lng: -43.1073,
    status: 'possiblyResolved',
    trustScore: 58,
    band: 'medium',
  },
  {
    id: id(6),
    categoryId: 2,
    lat: -22.9092,
    lng: -43.1028,
    status: 'possiblyResolved',
    trustScore: 44,
    band: 'medium',
  },
  {
    id: id(7),
    categoryId: 2,
    lat: -22.9007,
    lng: -43.1062,
    status: 'active',
    trustScore: 31,
    band: 'low',
  },
  {
    id: id(8),
    categoryId: 5,
    lat: -22.9059,
    lng: -43.1139,
    status: 'active',
    trustScore: 25,
    band: 'low',
  },
  {
    id: id(9),
    categoryId: 1,
    lat: -22.9079,
    lng: -43.1112,
    status: 'active',
    trustScore: 28,
    band: 'low',
  },
  {
    id: id(10),
    categoryId: 3,
    lat: -22.9038,
    lng: -43.1147,
    status: 'new',
    trustScore: null,
    band: null,
  },
  {
    id: id(11),
    categoryId: 4,
    lat: -22.9063,
    lng: -43.106,
    status: 'new',
    trustScore: null,
    band: null,
  },
  {
    id: id(12),
    categoryId: 2,
    lat: -22.9075,
    lng: -43.1097,
    status: 'new',
    trustScore: null,
    band: null,
  },
]

export const incidentHeatmap: Schema<'GetIncidentHeatmapResponse'>[] = [
  { lat: -22.903, lng: -43.115, count: 6 },
  { lat: -22.904, lng: -43.114, count: 4 },
  { lat: -22.908, lng: -43.107, count: 9 },
  { lat: -22.909, lng: -43.106, count: 7 },
  { lat: -22.91, lng: -43.108, count: 5 },
  { lat: -22.901, lng: -43.104, count: 3 },
  { lat: -22.9, lng: -43.103, count: 2 },
]

export const cellGroup = 'seguranca'
